'use strict';

// TODO: actual list + cached health status in "online" field

const beameSDK      = require('beame-sdk');
const module_name   = "ServiceManager";
const BeameLogger   = beameSDK.Logger;
const logger        = new BeameLogger(module_name);
const CommonUtils   = beameSDK.CommonUtils;
const SetupServices = require('../../../constants').SetupServices;
const Bootstrapper  = require('../../bootstrapper');


class ServiceManager {

	constructor() {
		this._appList = {};
	}

	listApplications(user) {

		return new Promise((resolve, reject) => {
				const returnList = () => {

					let approvedList = user.isAdmin ? this._appList : CommonUtils.filterHash(this._appList, (k, v) => v.code !== SetupServices.Admin.code);

					let formattedList = {};

					Object.keys(approvedList).forEach(key => {
						formattedList[approvedList[key].name] = {
							app_id: parseInt(key),
							online: approvedList[key].online,
							code:   approvedList[key].code,
							name:   approvedList[key].name,
							//TODO change to normal manage logic
							external:approvedList[key].isRasp
						};
					});
					logger.debug('app list:', formattedList);
					resolve(formattedList);
				};

				this.evaluateAppList().then(returnList).catch(reject);

			}
		);
	}

	evaluateAppList() {

		return new Promise((resolve, reject) => {

			const dataService = require('../../dataServices').getInstance();

			const bootstrapper = Bootstrapper.getInstance();

			let startRaspberryApps = bootstrapper.startRaspberryApp;

			dataService.getActiveServices().then(apps => {

				if (apps.length) {
					for (let app of apps) {


						if (!startRaspberryApps && app.code.startsWith('RASPBERRY_')) continue;

						this._appList[app.id] = {
							name:   app.name,
							app_id: app.id,
							code:   app.code,
							url:    app.url,
							online: app.isOnline,
							//TODO change to normal manage logic
							isRasp : app.code.startsWith('RASPBERRY_')
						};
					}

					resolve();
				}
				else {
					reject(`no services found`);
				}

			}).catch(error => {
				logger.error(`Get active services error ${BeameLogger.formatError(error)}`);
				reject(error);
			})
			}
		);
	}

	getAdminAppId() {

		return new Promise((resolve, reject) => {
				let adminApp = CommonUtils.filterHash(this._appList, (k, v) => v.code === SetupServices.Admin.code);

				let keys = Object.keys(adminApp);

				keys.length === 1 ? resolve(adminApp[keys[0]].app_id) : reject(`duplicate app found`);
			}
		);
	}

	getAppCodeById(app_id) {
		let app = this._appList[app_id];

		return app ? app.code : null;
	}

	getAppById(app_id) {
		let app = this._appList[app_id];

		return app;
	}

	isAdminService(app_id) {
		let app = this._appList[app_id];

		return app && app.code === SetupServices.Admin.code;
	}

	appUrlById(app_id) {
		logger.debug('got app request:', app_id);
		return new Promise((resolve, reject) => {
				let app = this._appList[app_id];

				app ? resolve(app.url) : reject(`Unknown appId ${app_id}`);
			}
		);
	}

}

module.exports = ServiceManager;

