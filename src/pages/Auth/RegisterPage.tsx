import { useState } from 'react'
import type { FormEvent } from 'react'
import { registerAccount } from '../../api/authApi'
import './RegisterPage.css'

type RegisterPageProps = {
  onBack: () => void
  onRegistered: (loginId: string) => void
}

function RegisterPage({ onBack, onRegistered }: RegisterPageProps) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    const passwordConfirm = String(form.get('passwordConfirm') ?? '')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      const account = await registerAccount({
        loginId: String(form.get('loginId') ?? ''),
        password,
        name: String(form.get('name') ?? ''),
        phone: String(form.get('phone') ?? ''),
      })
      onRegistered(account.loginId)
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : '회원가입에 실패했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page register-page">
      <section className="login-story">
        <a className="brand brand-light" href="#top">
          <span className="brand-mark">O</span>
          <span>oh!domi</span>
        </a>

        <div className="story-copy">
          <span className="kicker light">SMART FRANCHISE PARTNER</span>
          <h1>
            매장의 오늘을 읽고,
            <br />
            내일을 준비합니다.
          </h1>
          <p>
            AI 기반 위생 점검부터 매출·발주 예측까지.
            <br />
            오도미가 매장 운영의 모든 순간을 함께합니다.
          </p>
        </div>

        <p className="login-copyright">© 2026 OhDomi. Better stores, together.</p>
      </section>

      <section className="login-side">
        <div className="login-card register-card">
          <span className="mobile-brand brand">
            <span className="brand-mark">O</span>
            <span>oh!domi</span>
          </span>

          <span className="kicker">JOIN OHDOMI</span>
          <h2>가맹점주 회원가입</h2>
          <p className="muted">가입 정보는 OhDomi 서버의 MySQL 데이터베이스에 안전하게 저장됩니다.</p>

          <div className="registration-role">가맹점주 계정으로 가입됩니다</div>

          <form onSubmit={submit} className="auth-form">
            <label>
              이름
              <input name="name" placeholder="이름을 입력하세요" maxLength={100} required />
            </label>

            <label>
              전화번호
              <input name="phone" type="tel" placeholder="010-1234-5678" maxLength={30} required />
            </label>

            <label>
              아이디
              <input
                name="loginId"
                placeholder="영문, 숫자 4자 이상"
                minLength={4}
                maxLength={100}
                pattern="[A-Za-z0-9._-]+"
                required
              />
            </label>

            <label>
              비밀번호
              <input name="password" type="password" placeholder="8자 이상 입력하세요" minLength={8} maxLength={72} required />
            </label>

            <label>
              비밀번호 확인
              <input
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                minLength={8}
                maxLength={72}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="login-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '가입 처리 중...' : '회원가입 →'}
            </button>
          </form>

          <p className="signup-copy">
            이미 계정이 있으신가요?{' '}
            <button type="button" className="text-button" onClick={onBack}>
              로그인으로 돌아가기
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
