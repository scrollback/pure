/* @flow */

export default class InstallTracker {
	static getReferrer: () => Promise<string>;
	static getCampaignName: () => Promise<string>;
	static getCampaignSource: () => Promise<string>;
	static getCampaignMedium: () => Promise<string>;
	static getCampaignTerm: () => Promise<string>;
	static getCampaignContent: () => Promise<string>;
}
