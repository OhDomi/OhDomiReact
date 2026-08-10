import './RegisterPage.css'

type PrivacyPolicyPageProps = {
  onBack: () => void
}

function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <main className="login-page register-page">
      <section className="login-side" style={{ width: '100%' }}>
        <div className="login-card register-card" style={{ maxWidth: '640px' }}>
          <span className="kicker">PRIVACY POLICY</span>
          <h2>개인정보처리방침</h2>
          <p className="muted">시행일: 2026년 8월 10일</p>

          <div className="auth-form" style={{ gap: '18px', textAlign: 'left' }}>
            <section>
              <h3>1. 수집하는 개인정보 항목</h3>
              <p>
                OhDomi(이하 "회사")는 회원가입 및 서비스 제공을 위해 아래 항목을 수집합니다.
              </p>
              <ul>
                <li>필수: 아이디, 비밀번호(암호화 저장), 이름, 전화번호</li>
                <li>서비스 이용 과정에서 생성: 매장 운영 정보(재고·발주·매출), 위생점검 사진 및 판정 결과</li>
              </ul>
            </section>

            <section>
              <h3>2. 개인정보의 수집 및 이용 목적</h3>
              <ul>
                <li>가맹점주·관리자 회원 식별 및 로그인 인증</li>
                <li>매장 운영(재고/발주/위생점검/매출/게시판) 서비스 제공</li>
                <li>고객 문의 및 공지사항 처리</li>
              </ul>
            </section>

            <section>
              <h3>3. 보유 및 이용 기간</h3>
              <p>
                회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에서 별도 보존 기간을 정한 경우 해당 기간 동안
                분리 보관 후 파기합니다.
              </p>
            </section>

            <section>
              <h3>4. 개인정보의 제3자 제공</h3>
              <p>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.</p>
            </section>

            <section>
              <h3>5. 이용자의 권리와 행사 방법</h3>
              <p>
                이용자는 언제든지 본인의 개인정보를 열람·정정·삭제하거나 처리 정지를 요청할 수 있으며,
                회원 탈퇴를 통해 동의를 철회할 수 있습니다.
              </p>
            </section>

            <section>
              <h3>6. 개인정보 보호책임자</h3>
              <p>문의: OhDomi 운영팀 (연락처는 서비스 출시 전 확정 예정)</p>
            </section>
          </div>

          <p className="signup-copy">
            <button type="button" className="text-button" onClick={onBack}>
              ← 돌아가기
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default PrivacyPolicyPage
