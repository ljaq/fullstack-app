import { theme } from "antd"
import { CSSProperties } from "react"

export default function Logo({ style }: { style: CSSProperties }) {
	const { token: { colorPrimaryActive, colorPrimaryHover } } = theme.useToken()
  return (
		<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" style={style}>
		<defs>
			<linearGradient id="g1" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(195.849,182.633,-119.439,128.082,91.972,264.272)">
				<stop offset="0" stop-color={colorPrimaryActive}/>
				<stop offset=".6" stop-color={colorPrimaryHover}/>
			</linearGradient>
			<linearGradient id="g2" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(279.963,75.016,-60.524,225.88,102.041,152.02)">
				<stop offset="0" stop-color={colorPrimaryHover}/>
				<stop offset=".6" stop-color={colorPrimaryActive}/>
			</linearGradient>
			<linearGradient id="g3" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(99.931,-173.085,235.303,135.852,281.853,257.669)">
				<stop offset="0" stop-color={colorPrimaryActive}/>
				<stop offset="1" stop-color={colorPrimaryHover}/>
			</linearGradient>
			<linearGradient id="g4" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(129.307,-223.967,153.658,88.714,322.893,360.107)">
				<stop offset="0" stop-color={colorPrimaryHover}/>
				<stop offset="0.4" stop-color={colorPrimaryActive}/>
			</linearGradient>
		</defs>
		<path className="s0" fill="url(#g1)" d="m273.7 409.7l-35.7-41.4c-1.5-3.3-11.1-5.9-14.1-6.3-11.4-1.6-23.2-3.7-47.5-11.7-20.8-6.8-26.7-11.5-31.7-25.9-0.9-2.6-0.7-6.9-0.7-9.7q0-40.3 0-80.7c0-17.3 0-34.7 0-52-1.8-2.7-3.6-3.7-5-4-5.8-1.5-11.1 5.9-34.4 26.5-0.4 0.4-0.4 0.3-0.6 0.5-11.5 10.2-19.5 17.3-26 29-9 16.3-8.2 29.3-8 85 0.1 15.5 0 28.3 0 36.6 0 2.8 1.2 5.5 3.3 7.4 18.3 16.6 52.7 49.7 106.7 59 49.3 8.5 48.3 6.7 73.1 4.8 17.2-1.3 34.8-0.3 20.6-17.1z"/>
		<path className="s1" fill="url(#g2)" d="m70.4 265.3c-0.2-4 0.1-10.5-0.4-41.3-0.2-15.6-0.2-38.7 1-69 0.3-7.4 1.1-12 4-17 3.1-5.2 6-6.1 30-22 2.8-1.8 6.6-4.4 12-7.7 3.8-2.3 8.2-5 13.3-7.8 0.9-0.5 1.7-0.9 2.7-1.4 0 0 15.9-8.3 32-14 19.2-6.8 52.6-18.7 91-12 6.4 1.1 75.8 14.1 98.4 70.1 6.4 15.9 8.2 30.9 8 40.4-9.1-8-25.8-19.1-45.4-27.5-9.2-3.9-31.6-12.5-61-13 0 0-51.6-0.9-110 38-7.2 4.8-23.3 17.5-39.1 38.4-22.5 29.6-36.5 47.2-36.5 45.8z"/>
		<path className="s2" fill="url(#g3)" d="m231.5 71.3c-5.9 0.2 84.5 31.2 110.5 59.7 6.8 7.5 11 16 11 16 7.6 15.5 7.1 29.9 7 36-0.5 22.5 0.5 74.8 0.5 139.7 9.2 11.7 17 16 24.5 15 22.8-3.1 37.7-67.8 44.7-188.9 0.2-3-1-6-3.3-8-7.5-6.7-16.6-14.2-27.4-21.8 0 0-21.7-15.2-45-25.9-53.5-24.7-118.4-22-122.5-21.8z"/>
		<path className="s3" fill="url(#g4)" d="m258.1 307l89.3 97.8c3 3.4 7.7 3.6 12.1 2.3 12-3.4 29.7-9.1 41-16.6 13.4-8.8 19.1-15.2 26.7-25 0 0 1.9-3.4 3.3-7.4 7.2-21.6 0.5-183.5-0.5-208.1-18 151.9-34.3 187.3-46.5 187.5-6.6 0.1-18-9.7-23-15q-13.5-14.4-27-28.8c-1.9-2.1-4.6-3.2-7.4-3.2l-49 0.7c-15.5 0.1-24.6 9.4-19 15.8z"/>
	</svg>
  )
}