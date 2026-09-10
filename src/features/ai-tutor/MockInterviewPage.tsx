import { useEffect } from 'react';
import InterviewSetup from './InterviewSetup';
import MockInterviewSession from './MockInterviewSession';
import { useInterviewSession } from './useInterviewSession';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { restoreSessionProgress } from '../../services/sessionProgress';
export default function MockInterviewPage(){const session=useInterviewSession();const id=useAuthStore(s=>String(s.user?.id||'guest'));useEffect(()=>{if(useProgressStore.getState().progress?.userId!==id)restoreSessionProgress(id)},[id]);return session.started?<MockInterviewSession session={session}/>:<InterviewSetup topic={session.topic} setTopic={session.setTopic} difficulty={session.difficulty} setDifficulty={session.setDifficulty} camera={session.camera} setCamera={session.setCamera} mic={session.mic} setMic={session.setMic} feedback={session.feedback} setFeedback={session.setFeedback} start={session.start} busy={session.busy} error={session.deviceError}/>}
