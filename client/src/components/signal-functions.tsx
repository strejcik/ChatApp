import { currentSessionSubject, sessionForRemoteUser, sessionListSubject } from './state'

export async function startSession(recipient: string): Promise<void> {


    const newSession = {
        remoteUsername: recipient,
        messages: [],
    }
    console.log(`Starting session with ${recipient}`)
    const sessionList = [...sessionListSubject.value]
    sessionList.unshift(newSession)
    sessionListSubject.next(sessionList)
}

export function addMessageToSession(address: string, cm): void {
    const userSession = { ...sessionForRemoteUser(address)! }

    userSession.messages.push(cm)
    const sessionList = sessionListSubject.value.filter((session) => session.remoteUsername !== address)
    console.log('Filtered session list', { sessionList })
    sessionList.unshift(userSession)
    sessionListSubject.next(sessionList)
    if (currentSessionSubject.value?.remoteUsername === address) {
        currentSessionSubject.next(userSession)
    }
}