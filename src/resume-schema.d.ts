declare module 'resume-schema' {
  export function validate(
    resumeJson: object,
    callback: (err: Error[] | null, result: { valid: boolean }) => void,
  )

  export const schema: object
}
