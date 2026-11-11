// Release contract shared by the portal checks and the cross-site header check.
export const sharedNavRelease = "20261111-student-autoentry2";
export const sharedNavCss = new RegExp(`shared-system-nav\\.css\\?v=${sharedNavRelease}["']`);
export const sharedNavJs = new RegExp(`shared-system-nav\\.js\\?v=${sharedNavRelease}["']`);
