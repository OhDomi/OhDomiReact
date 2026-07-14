import { useState } from 'react'
import { dailySales, monthlySales, weeklySales } from '../data/storeSalesDummy'

function SalesTablePage() {
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const data = type === 'daily' ? dailySales : type === 'weekly' ? weeklySales : monthlySales

  return (
    <section className="sales-panel full-panel">
      <div className="panel-title-row">
        <h2>매출표</h2>

        <div className="tab-group">
          <button className={type === 'daily' ? 'tab active' : 'tab'} onClick={() => setType('daily')}>
            일별
          </button>
          <button className={type === 'weekly' ? 'tab active' : 'tab'} onClick={() => setType('weekly')}>
            주별
          </button>
          <button className={type === 'monthly' ? 'tab active' : 'tab'} onClick={() => setType('monthly')}>
            월별
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>{type === 'daily' ? '날짜' : '기간'}</th>
            <th>매출</th>
            <th>주문 수</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const label = 'date' in item ? item.date : item.period

            return (
              <tr key={label}>
                <td>{label}</td>
                <td>{item.sales.toLocaleString()}원</td>
                <td>{item.orders}건</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default SalesTablePage