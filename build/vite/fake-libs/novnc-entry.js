/**
 * Fake @novnc/novnc bare entry for electerm-web-demo.
 * `vnc-session.jsx` does `await import('@novnc/novnc')` and uses `mod.default`
 * as RFB. Re-export the tiny stub so vite never bundles the real noVNC lib.
 */
import RFB from './novnc.js'
export default RFB
export { RFB }
