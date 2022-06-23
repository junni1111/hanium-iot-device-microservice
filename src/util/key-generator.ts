import {
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from './constants/api-topic';
import { addMinutes, format } from 'date-fns';

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

/** key 문자열성 week가 맞는지 검토 필요 week 인지 day 인지 */
export const GenerateDayAverageKey = (
  masterId: number,
  slaveId: number,
  date: Date,
) =>
  `temperature/week/${masterId}/${slaveId}/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}`;

/** Todo: Rename*/
export const GenerateTemperatureKeys = (
  masterId: number,
  slaveId: number,
  beginDate: Date,
  endDate: Date,
  termMinutes: number,
) => {
  const generateKey = (masterId: number, slaveId: number, date: string) =>
    `temperature/week/${masterId}/${slaveId}/${date}`;
  const keys: string[] = [];

  /** Todo: 더 좋은 방법 고민 */
  for (
    let date = beginDate;
    date < endDate;
    date = addMinutes(date, termMinutes)
  ) {
    keys.push(generateKey(masterId, slaveId, format(date, `yyyyMMddHHmm`)));
  }

  return keys;
};
