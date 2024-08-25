declare module '@jsonresume/schema' {
  export function validate(
    resumeJson: object,
    callback: (err: Error[] | null, result: boolean) => void,
  )

  export const schema: object
}
