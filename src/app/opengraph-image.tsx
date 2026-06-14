import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Manabi Compass | 子どもの学習タイプ無料診断'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '8px', background: '#F7941D', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(247, 148, 29, 0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(247, 148, 29, 0.06)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#F7941D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: 'white', fontWeight: 'bold' }}>M</div>
          <span style={{ fontSize: '38px', fontWeight: 'bold', color: '#1B2A4A' }}>
            <span style={{ color: '#F7941D' }}>Manabi</span> Compass
          </span>
        </div>
        <div style={{ fontSize: '54px', fontWeight: 'bold', color: '#1B2A4A', textAlign: 'center', lineHeight: 1.25, marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>お子さんの<span style={{ color: '#F7941D' }}>学習タイプ</span>を</span>
          <span>3分で無料診断</span>
        </div>
        <div style={{ fontSize: '22px', color: '#666', textAlign: 'center', marginBottom: '48px', display: 'flex' }}>
          宿題が嫌い・勉強が続かない原因をAIが分析
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['登録不要', '完全無料', '約3分'].map((tag) => (
            <div key={tag} style={{ background: '#FFF8F0', border: '2px solid #F7941D', borderRadius: '100px', padding: '10px 28px', fontSize: '20px', color: '#F7941D', fontWeight: 'bold', display: 'flex' }}>{tag}</div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '28px', right: '40px', fontSize: '16px', color: '#aaa', display: 'flex' }}>www.manabi-compass.com</div>
      </div>
    ),
    { ...size }
  )
}
