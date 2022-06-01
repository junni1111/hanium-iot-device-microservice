import {
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from './constants/api-topic';

interface IRunningKey {
  sensor: ESlaveState | string;
  masterId: number;
  slaveId: number;
}

interface IPowerKey {
  sensor: ESlaveTurnPowerTopic;
  masterId: number;
  slaveId: number;
}

interface IConfigKey {
  sensor: ESlaveConfigTopic;
  masterId: number;
  slaveId: number;
}

export const SensorStateKey = ({ sensor, masterId, slaveId }: IRunningKey) =>
  `${sensor}/${masterId}/${slaveId}`;

export const SensorPowerKey = ({ sensor, masterId, slaveId }: IPowerKey) =>
  `${sensor}/${masterId}/${slaveId}`;

export const SensorConfigKey = ({ sensor, masterId, slaveId }: IConfigKey) =>
  `${sensor}/${masterId}/${slaveId}`;

/** Todo: Make Policy After ... */
export const MasterPollingKey = (key: string) => key;
