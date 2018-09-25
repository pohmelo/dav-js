"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MissionParams_1 = require("../MissionParams");
/**
 * @class The Class boat-charging/MissionParams represent the parameters of boat-charging mission.
 */
class MissionParams extends MissionParams_1.default {
    constructor(values) {
        super(MissionParams._protocol, MissionParams._messageType, values);
    }
    static getMessageType() {
        return MissionParams._messageType;
    }
    static getMessageProtocol() {
        return MissionParams._protocol;
    }
    serialize() {
        const formattedParams = super.serialize();
        return formattedParams;
    }
    deserialize(json) {
        super.deserialize(json);
    }
}
MissionParams._protocol = 'boat_charging';
MissionParams._messageType = 'mission';
exports.default = MissionParams;

//# sourceMappingURL=MissionParams.js.map
