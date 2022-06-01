import { ESlaveState, ESlaveTurnPowerTopic } from './constants/api-topic';

interface IRunningKey {
  sensor: ESlaveState;
  masterId: number;
  slaveId: number;
}

interface IPowerKey {
  sensor: ESlaveTurnPowerTopic;
  masterId: number;
  slaveId: number;
}

export const SensorRunningKey = ({ sensor, masterId, slaveId }: IRunningKey) =>
  `${sensor}/${masterId}/${slaveId}`;

export const SensorPowerKey = ({ sensor, masterId, slaveId }: IPowerKey) =>
  `${sensor}/${masterId}/${slaveId}`;
