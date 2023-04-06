import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// shows how the runner will run a javascript action with env / stdout protocol
test('Returns an error with broken links', () => {
  process.env['INPUT_GLOB'] = 'data/test/fails/**.md'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  expect(() => {
    cp.execSync(`node ${ip}`, options).toString()
  }).toThrow()
})

test('Runs succesfully with no broken links', () => {
  process.env['INPUT_GLOB'] = 'data/test/succeeds/**.md'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  expect(cp.execSync(`node ${ip}`, options).toString())
})

// Uncomment to debug locally with `npm run build && npm run test`
// test('Test using thehub repo shape', () => {
//   process.env['INPUT_GLOB'] = 'data/test/thehub/docs/**/*.md'
//   process.env['INPUT_ABSOLUTE-BASE-URL'] = 'https://thehub.github.com'
//   process.env['INPUT_ABSOLUTE-BASE-PATH'] = 'docs/'
//   process.env['ACTIONS_RUNNER_DEBUG'] = 'true'
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecSyncOptions = {
//     env: process.env,
//     stdio: 'inherit',
//   }
//   const child = cp.spawn('node', [ip], options) as any
//   child.on('spawn', function (code: any) {
//     process.stdout.write("\nStart Output\n")
//   });
//   //spit stdout to screen
//   child.stdout?.on('data', function (data: any) {   process.stdout.write(data.toString());  });
//   //spit stderr to screen
//   child.stderr?.on('data', function (data: any) {   process.stdout.write(data.toString());  });
//   //spit stdout to screen
//   child.on('close', function (code: any) { 
//     process.stdout.write("End Output\n\n")
//     expect(code).toBe(0)
//   });
// })