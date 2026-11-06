// The slice of lunar-javascript's API this mod uses (the library ships no types).
export interface LunarTimeObj {
  getZhi(): string
  getGanZhi(): string
  getTianShen(): string
  getTianShenLuck(): string
  getMinHm(): string
  getMaxHm(): string
}

export interface JieQiObj {
  getName(): string
  getSolar(): SolarObj
}

export interface LunarObj {
  toString(): string
  getYear(): number
  getMonth(): number
  getDay(): number
  getYearInChinese(): string
  getMonthInChinese(): string
  getDayInChinese(): string
  getYearInGanZhi(): string
  getMonthInGanZhi(): string
  getDayInGanZhi(): string
  getYearShengXiao(): string
  getDayYi(): string[]
  getDayJi(): string[]
  getDayChongDesc(): string
  getDayNaYin(): string
  getDayChongShengXiao(): string
  getDaySha(): string
  getJieQi(): string
  getPrevJieQi(): JieQiObj
  getNextJieQi(): JieQiObj
  getDayTianShen(): string
  getDayTianShenLuck(): string
  getZhiXing(): string
  getTimes(): LunarTimeObj[]
  getSolar(): SolarObj
}

export interface SolarObj {
  getYear(): number
  getMonth(): number
  getDay(): number
  getLunar(): LunarObj
  toYmd(): string
}

export declare const Solar: {
  fromYmd(year: number, month: number, day: number): SolarObj
}

export declare const Lunar: {
  fromYmd(year: number, month: number, day: number): LunarObj
}

export declare const LunarUtil: unknown
