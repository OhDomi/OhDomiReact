// 로그인 성공 시 App.tsx가 기록하는 마지막 로그인 유형 — 페이지 새로고침 후에도
// role을 prop으로 안 받는 위치(API 유틸 등)에서 "지금 관리자로 로그인돼 있는가"를
// 확인할 때 재사용한다.
export const LAST_ROLE_KEY = 'oh-domi-last-role'

export function isAdminSession(): boolean {
  return localStorage.getItem(LAST_ROLE_KEY) === 'admin'
}
