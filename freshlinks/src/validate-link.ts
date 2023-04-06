import { MarkdownLink } from './parse-markdown-links'
import { join, dirname } from 'path'
import { parse } from 'url'
import { promises as fs } from 'fs'

export enum LinkValidity {
  Valid,
  Invalid,
  Unknown,
  NonRelative,
}

export async function valid_link(link: MarkdownLink, absoluteBaseUrl?: string): Promise<LinkValidity> {
  // If link is using an absolute link with the base url, and absoluteBaseUrl is set, then we throw
  // an "NonRelative" error because we want it to be a relative link instead
  if (absoluteBaseUrl && link.link.includes(absoluteBaseUrl)) {
    return LinkValidity.NonRelative
  }

  const parsedUrl = parse(link.link)
  if (!parsedUrl.protocol && !parsedUrl.host) {
    let linkPath = parsedUrl.pathname
    if (!linkPath) {
      linkPath = ''
    }

    const decodedLinkPath = decodeURIComponent(linkPath)

    const sourceFile = dirname(link.sourceFile)

    // Throw NonRelative error for absolute paths too
    if (decodedLinkPath.startsWith('/')) {
      return LinkValidity.NonRelative
    } else {
      const joinedLinkPath = join(sourceFile, decodedLinkPath)
      try {
        await fs.access(joinedLinkPath)
        return LinkValidity.Valid
      } catch (error) {
        return LinkValidity.Invalid
      }
    }
  } else {
    return LinkValidity.Unknown
  }
}
