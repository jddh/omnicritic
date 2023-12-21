export default function Throbber({ status }) {
	return (
		<>
			{!status &&
				<svg className="load-throbber throbber" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path d="M0 32H512V480H0V32zM48 352v64h64V352H48zm416 0H400v64h64V352zM48 224v64h64V224H48zm416 0H400v64h64V224zM48 96v64h64V96H48zm416 0H400v64h64V96zM160 96V224H352V96H160zM352 288H160V416H352V288z" /></svg>
			}

			{status == 'error' &&
				<svg className="error-throbber throbber" xmlns="http://www.w3.org/2000/svg" height="16" width="20" viewBox="0 0 640 512"><path opacity="1"  d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zM320 160c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
			}
		</>
	)
}