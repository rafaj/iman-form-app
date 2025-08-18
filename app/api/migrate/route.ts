import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(req: NextRequest) {
  // IMPORTANT: Add a security check here to prevent unauthorized access
  // For example, check for a secret token in the request headers or query params
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.MIGRATION_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Running Prisma migrations...')
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
    console.log('Prisma migrate deploy stdout:', stdout)
    if (stderr) {
      console.error('Prisma migrate deploy stderr:', stderr)
    }
    return NextResponse.json({ message: 'Migrations applied successfully', stdout, stderr }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error applying migrations:', error)
    let errorMessage = 'Unknown error'
    let errorStdout = ''
    let errorStderr = ''

    if (error instanceof Error) {
      errorMessage = error.message
      // Check if it's an ExecException from child_process
      if ('stdout' in error && typeof error.stdout === 'string') {
        errorStdout = error.stdout
      }
      if ('stderr' in error && typeof error.stderr === 'string') {
        errorStderr = error.stderr
      }
    }

    return NextResponse.json({ message: 'Failed to apply migrations', error: errorMessage, stdout: errorStdout, stderr: errorStderr }, { status: 500 })
  }
}
