import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Manabi Compass | 子どもの学習タイプ無料診断'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#1B2A4A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(247, 148, 29, 0.12)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(247, 148, 29, 0.08)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F7941D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>M</div>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>
            <span style={{ color: '#F7941D' }}>Manabi</span> Compass
          </span>
        </div>
        <div style={{ fontSize: '52px', fontWeight: 'bold', color: 'white', textAlign: 'center', lineHeight: 1.3, marginBottom: '24px', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>お子さんの<span style={{ color: '#F7941D' }}>学習タイプ</span>を</span>
          <span>3分で無料診断</span>
        </div>
        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: '48px', display: 'flex' }}>
          宿題が嫌い・勉強が続かない原因をAIが分析
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['登録不要', '完全無料', '約3分'].map((tag) => (
            <div key={tag} style={{ background: 'rgba(247, 148, 29, 0.2)', border: '1.5px solid #F7941D', borderRadius: '100px', padding: '10px 28px', fontSize: '20px', color: '#F7941D', fontWeight: 'bold', display: 'flex' }}>{tag}</div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '28px', right: '40px', fontSize: '18px', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>www.manabi-compass.com</div>
      </div>
    ),
    { ...size }
  )
}
