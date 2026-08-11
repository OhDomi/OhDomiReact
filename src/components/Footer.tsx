import { useState } from 'react'
import './Footer.css'

type PolicyKey = 'privacy' | 'terms' | 'refund'

const POLICIES: Record<PolicyKey, { title: string; body: { heading: string; text: string }[] }> = {
  privacy: {
    title: '개인정보처리방침',
    body: [
      { heading: '1. 수집하는 개인정보 항목', text: '아이디, 비밀번호(암호화 저장), 이름, 전화번호 및 서비스 이용 과정에서 생성되는 매장 운영 정보(재고·발주·매출), 위생점검 사진 및 판정 결과를 수집합니다.' },
      { heading: '2. 수집 및 이용 목적', text: '가맹점주·관리자 회원 식별 및 로그인 인증, 매장 운영 서비스 제공, 고객 문의 및 공지사항 처리를 위해 이용합니다.' },
      { heading: '3. 보유 및 이용 기간', text: '회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에서 별도 보존 기간을 정한 경우 해당 기간 동안 분리 보관 후 파기합니다.' },
      { heading: '4. 제3자 제공', text: '회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.' },
      { heading: '5. 이용자의 권리', text: '이용자는 언제든지 본인의 개인정보를 열람·정정·삭제하거나 처리 정지를 요청할 수 있으며, 회원 탈퇴를 통해 동의를 철회할 수 있습니다.' },
    ],
  },
  terms: {
    title: '서비스 이용약관',
    body: [
      { heading: '제1조 (목적)', text: '이 약관은 OhDomi(이하 "회사")가 제공하는 프랜차이즈 매장 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.' },
      { heading: '제2조 (회원가입)', text: '이용자는 회사가 정한 절차에 따라 회원가입을 신청하며, 회사는 특별한 사정이 없는 한 이를 승낙합니다.' },
      { heading: '제3조 (서비스의 제공)', text: '회사는 매장 관리, 위생점검, 매출 분석, 발주 관리, 리스크 예측 등의 기능을 제공합니다. 서비스 내용은 운영상 필요에 따라 변경될 수 있습니다.' },
      { heading: '제4조 (회원의 의무)', text: '회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수해야 하며, 회사의 업무에 방해되는 행위를 해서는 안 됩니다.' },
      { heading: '제5조 (계약 해지)', text: '회원은 언제든지 서비스 내 회원탈퇴를 통해 이용계약을 해지할 수 있습니다.' },
    ],
  },
  refund: {
    title: '환불 규정',
    body: [
      { heading: '1. 환불 원칙', text: '유료 서비스 결제 후 서비스를 이용하지 않은 경우, 결제일로부터 7일 이내 전액 환불을 요청할 수 있습니다.' },
      { heading: '2. 부분 이용 시 환불', text: '서비스를 일부 이용한 경우, 이용 기간에 해당하는 금액을 공제한 후 잔액을 환불합니다.' },
      { heading: '3. 환불 제외 사유', text: '회원의 귀책사유로 이용이 제한된 경우, 이미 제공이 완료된 부가 서비스에 대해서는 환불이 제한될 수 있습니다.' },
      { heading: '4. 환불 절차', text: '환불 신청은 고객센터 또는 공지/문의게시판을 통해 접수하며, 접수 후 영업일 기준 5일 이내 처리합니다.' },
    ],
  },
}

function Footer() {
  const [openPolicy, setOpenPolicy] = useState<PolicyKey | null>(null)

  return (
    <>
      <footer className="app-footer">
        <div className="app-footer-links">
          <button type="button" onClick={() => setOpenPolicy('privacy')}>개인정보처리방침</button>
          <button type="button" onClick={() => setOpenPolicy('terms')}>서비스 이용약관</button>
          <button type="button" onClick={() => setOpenPolicy('refund')}>환불 규정</button>
        </div>

        <p className="app-footer-info">
          OhDomi(주) 사업자 정보 &nbsp;대표자: 류연우 · 박지웅 · 손가영 · 유승찬 · 이승호 · 조성준
          &nbsp;|&nbsp; 이메일: Doraemon_muscular_man@ohdomi.co &nbsp;|&nbsp; 전화: 02-1234-5678
        </p>

        <p className="app-footer-copyright">Copyright ©2026 OhDomi. All rights reserved.</p>
      </footer>

      {openPolicy && (
        <div className="app-footer-backdrop" onClick={() => setOpenPolicy(null)}>
          <div className="app-footer-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="detail-close" aria-label="닫기" onClick={() => setOpenPolicy(null)}>×</button>
            <h2>{POLICIES[openPolicy].title}</h2>
            {POLICIES[openPolicy].body.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.text}</p>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Footer
