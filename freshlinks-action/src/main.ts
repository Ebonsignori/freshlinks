import path from "path"
import { URL } from "url"
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as freshlinks from 'freshlinks'
import Mustache from 'mustache'

const defaultErrorTemplate = `
Could not find {{link}}.
{{#suggestion}}
Perhaps you meant \`{{suggested_link}}\`?
{{/suggestion}}
`.trim()

const absolutePathErrorTemplate = `
{{link}} is absolute and should be relative.
{{#suggestion}}
Perhaps you meant \`{{suggested_link}}\`?
{{/suggestion}}
`.trim()

async function calculatePossibleLinkDestinations(
  suggestions: boolean
): Promise<string[]> {
  let possibleLinkDestinations: string[]
  if (suggestions) {
    possibleLinkDestinations = await freshlinks.gitLsFiles()
  } else {
    possibleLinkDestinations = []
  }
  return possibleLinkDestinations
}

async function checkFiles(
  globber: glob.Globber,
  suggestions: boolean,
  possibleLinkDestinations: string[],
  annotationTemplate: string,
  absoluteBaseUrl: string,
  absoluteBasePath: string,
): Promise<boolean> {
  let failCount = 0
  for await (const [
    link,
    valid
  ] of freshlinks.validate_markdown_links_from_files(globber.globGenerator(), absoluteBaseUrl)) {
    if (valid === freshlinks.LinkValidity.Invalid) {
      failCount++
    } else if (valid === freshlinks.LinkValidity.NonRelative) {
      failCount++
    }
    if (valid === freshlinks.LinkValidity.Invalid) {
      reportFile(
        link,
        suggestions,
        possibleLinkDestinations,
        annotationTemplate,
      )
    } else if (valid === freshlinks.LinkValidity.NonRelative && absoluteBaseUrl !== '') {
      reportFile(
        link,
        suggestions,
        possibleLinkDestinations,
        absolutePathErrorTemplate,
        valid,
        absoluteBaseUrl,
        absoluteBasePath
      )
    }
  }
  return failCount > 0 ? true : false
}

function reportFile(
  link: freshlinks.MarkdownLink,
  suggestions: boolean,
  possibleLinkDestinations: string[],
  annotationTemplate: string,
  valid?: freshlinks.LinkValidity,
  absoluteBaseUrl?: string,
  absoluteBasePath?: string
): void {
  let sourceFile = link.sourceFile.replace(
    '/home/runner/work/freshlinks/freshlinks/',
    ''
  )

  let suggestion: string | null = null
  if (valid === freshlinks.LinkValidity.NonRelative && absoluteBaseUrl !== '' && suggestions) {
    suggestion = calculateRelativePath()
  } else {
    suggestion = calculateSuggestion()
  }


  type SuggestionTemplate = {suggested_link: string}
  type TemplateArgs = {link: string; suggestion?: SuggestionTemplate}
  const templateArgs: TemplateArgs = {link: link.link, suggestion: undefined}
  if (suggestion) {
    templateArgs.suggestion = {suggested_link: suggestion}
  }

  // Replace newline with %0A
  const errorMsg = Mustache.render(annotationTemplate, templateArgs).replace(
    // We can't simply use '\n', since replace with a string on replaces
    // the first occurrence
    /\n/g,
    '%0A'
  )

  const msg = `file=${sourceFile},line=${link.startLine},col=${link.startCol}::${errorMsg}`
  console.log(`::error ${msg}`) // eslint-disable-line no-console

  function calculateSuggestion(): string | null {
    if (suggestions) {
      const [suggestedLink, distance] = freshlinks.suggestPath(
        link.sourceFile,
        link.link,
        possibleLinkDestinations
      )
      // Don't suggest matches that are too far away from the original
      // link
      if (distance <= freshlinks.SUGGEST_MIN_DISTANCE) {
        return suggestedLink
      }
    }
    return null
  }

  function calculateRelativePath(): string | null {
    let absoluteFilePath
    let hashLink = ''
    if (link.link.startsWith("/")) {
      absoluteFilePath = link.link
    } else {
      const urlParts = link.link.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
      // urlParts[5] is the absolute path of the link, e.g. /epd/planning
      absoluteFilePath = urlParts?.[5] || ''
      hashLink = urlParts?.[8] || ''
    }
    if (absoluteBasePath && !absoluteFilePath.startsWith(`/${absoluteBasePath}`)) {
      absoluteFilePath = `/${absoluteBasePath}` + absoluteFilePath
    }
    let relativePath = path.relative(sourceFile, absoluteFilePath)
    // Append hash link from original URL if it exists, e.g. #first-heading
    if (hashLink) {
      relativePath += hashLink
    }
    if (relativePath) {
      return relativePath
    }
    return null
  }
}

function getAnnotationTemplate(): string {
  const userTemplate = core.getInput('error-template')
  return userTemplate !== '' ? userTemplate : defaultErrorTemplate
}

async function run(): Promise<void> {
  try {
    const scan_glob: string = core.getInput('glob', {required: true})
    const suggestions: boolean = core.getInput('suggestions') !== 'false'
    // Relative-only link enforcement is enabled when absolute-base-url is set
    let absoluteBaseUrl: string = core.getInput('absolute-base-url')
    try {
      absoluteBaseUrl = new URL(absoluteBaseUrl).hostname
    } catch (error) {
      core.setFailed("absolute-base-url must be a valid URL")
    }
    // For suggesting relative paths, we need to know the absolute base path of the file in the repo relative to the ending of the absolute base url
    // e.g. if a link is https://thehub.github.com/epd/planning and absolute-base-url is thehub.github.com
    // and the file lives in thehub/docs/epd/planning.md then the absolute-base-path in this case is "docs/"
    let absoluteBasePath: string = core.getInput('absolute-base-path')
    if (absoluteBasePath !== '') {
      if (absoluteBasePath.slice(-1) === '/') {
        absoluteBasePath = absoluteBasePath.slice(0, -1)
      }
      if (absoluteBasePath.startsWith('/')) {
        core.setFailed('absolute-base-path cannot start with a /. Make this the path relative to the repo root')
      }
    }
    const annotationTemplate = getAnnotationTemplate()
    core.debug(`Scanning glob ${scan_glob}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const possibleLinkDestinations: string[] = await calculatePossibleLinkDestinations(
      suggestions
    )

    const globber = await glob.create(scan_glob)

    const failed = await checkFiles(
      globber,
      suggestions,
      possibleLinkDestinations,
      annotationTemplate,
      absoluteBaseUrl,
      absoluteBasePath
    )

    if (failed) {
      core.setFailed('Invalid links found')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

Mustache.escape = (text: string) => text
run()
