import { SignJWT, importPKCS8 } from 'jose'

export async function generateJitsiToken({
  appId,
  apiKeyId,
  privateKeyPem,
  name,
  email,
  isModerator,
  roomName,
}: {
  appId: string
  apiKeyId: string
  privateKeyPem: string
  name: string
  email: string
  isModerator: boolean
  roomName: string
}) {
  const pem = privateKeyPem.replace(/\\n/g, '\n')
  const privateKey = await importPKCS8(pem, 'RS256')

  return new SignJWT({
    aud: 'jitsi',
    iss: 'chat',
    sub: appId,
    room: roomName,
    context: {
      user: {
        name,
        email,
        moderator: String(isModerator),
        avatar: '',
      },
      features: {
        livestreaming: 'false',
        recording: 'false',
        transcription: 'false',
        'outbound-call': 'false',
      },
    },
  })
    .setProtectedHeader({ alg: 'RS256', kid: apiKeyId })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey)
}