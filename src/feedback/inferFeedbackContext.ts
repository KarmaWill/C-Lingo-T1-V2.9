import type { FeedbackContext } from './feedbackTypes';

export function inferFeedbackContext(pathname: string, search = ''): FeedbackContext {
  const route = `${pathname}${search}` || '/';

  if (pathname === '/AI' || pathname === '/') {
    return { module: 'home', route };
  }
  if (pathname.startsWith('/library/hub/fun-chinese')) {
    return { module: 'fun_chinese', route };
  }
  if (pathname === '/starting-learning') {
    return { module: 'fun_chinese_ebook', route };
  }
  if (pathname.startsWith('/lesson/')) {
    return { module: 'c_lingo_chinese', route, lessonId: pathname.split('/')[2] };
  }
  if (pathname === '/lingo-flash' || pathname === '/flashcards') {
    return { module: 'flashcards', route };
  }
  if (pathname.startsWith('/hsk-') || pathname === '/hsk-test' || pathname === '/hsk-mock-exam') {
    return { module: 'hsk', route };
  }
  if (pathname === '/study-report') {
    return { module: 'study_report', route };
  }
  if (pathname === '/mistakes-review') {
    return { module: 'mistakes_review', route };
  }
  if (pathname === '/ai-chat') {
    return { module: 'ai_tutor', route };
  }
  if (pathname === '/grammar-puzzle' || pathname === '/syntax-snap') {
    return { module: 'practice', route };
  }

  return { module: 'general', route };
}
