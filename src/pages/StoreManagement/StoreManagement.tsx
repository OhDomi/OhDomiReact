import './StoreManagement.css'
import {
  facilityStatus,
  operationChecklist,
  storeInfo,
  todayStaff,
} from './storeManagementDummy'

function StoreManagement() {
  return (
    <div className="store-management">
      <header className="page-heading">
        <div>
          <span className="kicker">STORE MANAGEMENT</span>
          <h1>매장 관리</h1>
          <p>내 매장의 기본 정보, 운영 상태, 설비 점검, 근무자 현황을 확인하세요.</p>
        </div>

        <button className="primary-action" type="button">
          운영 리포트 보기
        </button>
      </header>

      <section className="store-management-grid">
        <article className="panel store-info-card">
          <div className="panel-head">
            <div>
              <span className="panel-label">STORE PROFILE</span>
              <h2>매장 기본 정보</h2>
            </div>

            <span className="status-pill success">● {storeInfo.operationStatus}</span>
          </div>

          <dl className="store-info-list">
            <div>
              <dt>매장명</dt>
              <dd>{storeInfo.storeName}</dd>
            </div>
            <div>
              <dt>점주명</dt>
              <dd>{storeInfo.ownerName}</dd>
            </div>
            <div>
              <dt>지역</dt>
              <dd>{storeInfo.region}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{storeInfo.phone}</dd>
            </div>
            <div className="wide">
              <dt>주소</dt>
              <dd>{storeInfo.address}</dd>
            </div>
            <div>
              <dt>영업시간</dt>
              <dd>
                {storeInfo.openTime} - {storeInfo.closeTime}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">TODAY CHECKLIST</span>
              <h2>오늘 운영 체크리스트</h2>
            </div>
          </div>

          <div className="store-checklist">
            {operationChecklist.map((item) => (
              <label className="store-check-item" key={item.task}>
                <input type="checkbox" defaultChecked={item.checked} />
                <span>{item.task}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">FACILITY STATUS</span>
              <h2>설비 점검 현황</h2>
            </div>

            <button className="select-button" type="button">
              점검 등록
            </button>
          </div>

          <div className="facility-grid">
            {facilityStatus.map((item) => (
              <div className="facility-card" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.memo}</p>
                  <small>최근 점검: {item.lastCheckedAt}</small>
                </div>

                <span className={`facility-status ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel wide-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">STAFF SCHEDULE</span>
              <h2>오늘 근무자 현황</h2>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>역할</th>
                  <th>근무시간</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {todayStaff.map((staff) => (
                  <tr key={staff.name}>
                    <td>
                      <span className="store-avatar">{staff.name[0]}</span>
                      <strong>{staff.name}</strong>
                    </td>
                    <td>{staff.role}</td>
                    <td>{staff.workTime}</td>
                    <td>{staff.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === '정상') return 'safe'
  if (status === '주의') return 'warning'
  return 'danger'
}

export default StoreManagement