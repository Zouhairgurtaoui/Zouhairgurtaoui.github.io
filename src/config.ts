import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Zouhair Guertaoui",
	subtitle: "Cybersecurity Engineer & Developer",
	lang: "en",
	themeColor: {
		hue: 250, // Default Fuwari hue (cyan-ish)
		fixed: false, // Allow visitors to change
	},
	banner: {
		enable: false, // User will add their own banner later
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 3, // Show h2 and h3 in TOC
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/Zouhairgurtaoui",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpeg",
	name: "Zouhair Guertaoui",
	bio: "IT Security & Digital Trust engineering student specializing in network security, penetration testing, and secure architecture design.",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Zouhairgurtaoui",
		},
		{
			name: "LinkedIn",
			icon: "fa6-brands:linkedin",
			url: "https://linkedin.com/in/zouhair-guertaoui",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
