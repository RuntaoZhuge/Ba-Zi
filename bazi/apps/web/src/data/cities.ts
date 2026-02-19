export interface City {
  id: string;
  zh: string;
  en: string;
  pinyin: string;
  provinceZh: string;
  provinceEn: string;
  longitude: number;
  latitude: number;
}

export const CITIES: City[] = [
  // 直辖市
  { id: 'beijing', zh: '北京', en: 'Beijing', pinyin: 'beijing', provinceZh: '北京市', provinceEn: 'Beijing', longitude: 116.4, latitude: 39.9 },
  { id: 'shanghai', zh: '上海', en: 'Shanghai', pinyin: 'shanghai', provinceZh: '上海市', provinceEn: 'Shanghai', longitude: 121.5, latitude: 31.2 },
  { id: 'tianjin', zh: '天津', en: 'Tianjin', pinyin: 'tianjin', provinceZh: '天津市', provinceEn: 'Tianjin', longitude: 117.2, latitude: 39.1 },
  { id: 'chongqing', zh: '重庆', en: 'Chongqing', pinyin: 'chongqing', provinceZh: '重庆市', provinceEn: 'Chongqing', longitude: 106.6, latitude: 29.6 },

  // 省会城市
  { id: 'shijiazhuang', zh: '石家庄', en: 'Shijiazhuang', pinyin: 'shijiazhuang', provinceZh: '河北省', provinceEn: 'Hebei', longitude: 114.5, latitude: 38.0 },
  { id: 'taiyuan', zh: '太原', en: 'Taiyuan', pinyin: 'taiyuan', provinceZh: '山西省', provinceEn: 'Shanxi', longitude: 112.6, latitude: 37.9 },
  { id: 'hohhot', zh: '呼和浩特', en: 'Hohhot', pinyin: 'huhehaote', provinceZh: '内蒙古', provinceEn: 'Inner Mongolia', longitude: 111.8, latitude: 40.8 },
  { id: 'shenyang', zh: '沈阳', en: 'Shenyang', pinyin: 'shenyang', provinceZh: '辽宁省', provinceEn: 'Liaoning', longitude: 123.4, latitude: 41.8 },
  { id: 'changchun', zh: '长春', en: 'Changchun', pinyin: 'changchun', provinceZh: '吉林省', provinceEn: 'Jilin', longitude: 125.3, latitude: 43.9 },
  { id: 'harbin', zh: '哈尔滨', en: 'Harbin', pinyin: 'haerbin', provinceZh: '黑龙江省', provinceEn: 'Heilongjiang', longitude: 126.6, latitude: 45.8 },
  { id: 'nanjing', zh: '南京', en: 'Nanjing', pinyin: 'nanjing', provinceZh: '江苏省', provinceEn: 'Jiangsu', longitude: 118.8, latitude: 32.1 },
  { id: 'hangzhou', zh: '杭州', en: 'Hangzhou', pinyin: 'hangzhou', provinceZh: '浙江省', provinceEn: 'Zhejiang', longitude: 120.2, latitude: 30.3 },
  { id: 'hefei', zh: '合肥', en: 'Hefei', pinyin: 'hefei', provinceZh: '安徽省', provinceEn: 'Anhui', longitude: 117.3, latitude: 31.8 },
  { id: 'fuzhou', zh: '福州', en: 'Fuzhou', pinyin: 'fuzhou', provinceZh: '福建省', provinceEn: 'Fujian', longitude: 119.3, latitude: 26.1 },
  { id: 'nanchang', zh: '南昌', en: 'Nanchang', pinyin: 'nanchang', provinceZh: '江西省', provinceEn: 'Jiangxi', longitude: 115.9, latitude: 28.7 },
  { id: 'jinan', zh: '济南', en: 'Jinan', pinyin: 'jinan', provinceZh: '山东省', provinceEn: 'Shandong', longitude: 117.0, latitude: 36.7 },
  { id: 'zhengzhou', zh: '郑州', en: 'Zhengzhou', pinyin: 'zhengzhou', provinceZh: '河南省', provinceEn: 'Henan', longitude: 113.7, latitude: 34.8 },
  { id: 'wuhan', zh: '武汉', en: 'Wuhan', pinyin: 'wuhan', provinceZh: '湖北省', provinceEn: 'Hubei', longitude: 114.3, latitude: 30.6 },
  { id: 'changsha', zh: '长沙', en: 'Changsha', pinyin: 'changsha', provinceZh: '湖南省', provinceEn: 'Hunan', longitude: 112.9, latitude: 28.2 },
  { id: 'guangzhou', zh: '广州', en: 'Guangzhou', pinyin: 'guangzhou', provinceZh: '广东省', provinceEn: 'Guangdong', longitude: 113.3, latitude: 23.1 },
  { id: 'nanning', zh: '南宁', en: 'Nanning', pinyin: 'nanning', provinceZh: '广西', provinceEn: 'Guangxi', longitude: 108.4, latitude: 22.8 },
  { id: 'haikou', zh: '海口', en: 'Haikou', pinyin: 'haikou', provinceZh: '海南省', provinceEn: 'Hainan', longitude: 110.4, latitude: 20.0 },
  { id: 'chengdu', zh: '成都', en: 'Chengdu', pinyin: 'chengdu', provinceZh: '四川省', provinceEn: 'Sichuan', longitude: 104.1, latitude: 30.6 },
  { id: 'guiyang', zh: '贵阳', en: 'Guiyang', pinyin: 'guiyang', provinceZh: '贵州省', provinceEn: 'Guizhou', longitude: 106.7, latitude: 26.6 },
  { id: 'kunming', zh: '昆明', en: 'Kunming', pinyin: 'kunming', provinceZh: '云南省', provinceEn: 'Yunnan', longitude: 102.7, latitude: 25.0 },
  { id: 'lhasa', zh: '拉萨', en: 'Lhasa', pinyin: 'lasa', provinceZh: '西藏', provinceEn: 'Tibet', longitude: 91.1, latitude: 29.7 },
  { id: 'xian', zh: '西安', en: "Xi'an", pinyin: 'xian', provinceZh: '陕西省', provinceEn: 'Shaanxi', longitude: 108.9, latitude: 34.3 },
  { id: 'lanzhou', zh: '兰州', en: 'Lanzhou', pinyin: 'lanzhou', provinceZh: '甘肃省', provinceEn: 'Gansu', longitude: 103.8, latitude: 36.1 },
  { id: 'xining', zh: '西宁', en: 'Xining', pinyin: 'xining', provinceZh: '青海省', provinceEn: 'Qinghai', longitude: 101.8, latitude: 36.6 },
  { id: 'yinchuan', zh: '银川', en: 'Yinchuan', pinyin: 'yinchuan', provinceZh: '宁夏', provinceEn: 'Ningxia', longitude: 106.2, latitude: 38.5 },
  { id: 'urumqi', zh: '乌鲁木齐', en: 'Urumqi', pinyin: 'wulumuqi', provinceZh: '新疆', provinceEn: 'Xinjiang', longitude: 87.6, latitude: 43.8 },
  { id: 'taipei', zh: '台北', en: 'Taipei', pinyin: 'taibei', provinceZh: '台湾', provinceEn: 'Taiwan', longitude: 121.6, latitude: 25.0 },
  { id: 'hongkong', zh: '香港', en: 'Hong Kong', pinyin: 'xianggang', provinceZh: '香港', provinceEn: 'Hong Kong', longitude: 114.2, latitude: 22.3 },
  { id: 'macau', zh: '澳门', en: 'Macau', pinyin: 'aomen', provinceZh: '澳门', provinceEn: 'Macau', longitude: 113.5, latitude: 22.2 },

  // 主要城市
  { id: 'shenzhen', zh: '深圳', en: 'Shenzhen', pinyin: 'shenzhen', provinceZh: '广东省', provinceEn: 'Guangdong', longitude: 114.1, latitude: 22.5 },
  { id: 'suzhou', zh: '苏州', en: 'Suzhou', pinyin: 'suzhou', provinceZh: '江苏省', provinceEn: 'Jiangsu', longitude: 120.6, latitude: 31.3 },
  { id: 'qingdao', zh: '青岛', en: 'Qingdao', pinyin: 'qingdao', provinceZh: '山东省', provinceEn: 'Shandong', longitude: 120.4, latitude: 36.1 },
  { id: 'dalian', zh: '大连', en: 'Dalian', pinyin: 'dalian', provinceZh: '辽宁省', provinceEn: 'Liaoning', longitude: 121.6, latitude: 38.9 },
  { id: 'xiamen', zh: '厦门', en: 'Xiamen', pinyin: 'xiamen', provinceZh: '福建省', provinceEn: 'Fujian', longitude: 118.1, latitude: 24.5 },
  { id: 'ningbo', zh: '宁波', en: 'Ningbo', pinyin: 'ningbo', provinceZh: '浙江省', provinceEn: 'Zhejiang', longitude: 121.6, latitude: 29.9 },
  { id: 'dongguan', zh: '东莞', en: 'Dongguan', pinyin: 'dongguan', provinceZh: '广东省', provinceEn: 'Guangdong', longitude: 113.8, latitude: 23.0 },
  { id: 'wuxi', zh: '无锡', en: 'Wuxi', pinyin: 'wuxi', provinceZh: '江苏省', provinceEn: 'Jiangsu', longitude: 120.3, latitude: 31.6 },
  { id: 'foshan', zh: '佛山', en: 'Foshan', pinyin: 'foshan', provinceZh: '广东省', provinceEn: 'Guangdong', longitude: 113.1, latitude: 23.0 },
  { id: 'zhuhai', zh: '珠海', en: 'Zhuhai', pinyin: 'zhuhai', provinceZh: '广东省', provinceEn: 'Guangdong', longitude: 113.6, latitude: 22.3 },
  { id: 'beihai', zh: '北海', en: 'Beihai', pinyin: 'beihai', provinceZh: '广西', provinceEn: 'Guangxi', longitude: 109.1, latitude: 21.5 },
  { id: 'sanya', zh: '三亚', en: 'Sanya', pinyin: 'sanya', provinceZh: '海南省', provinceEn: 'Hainan', longitude: 109.5, latitude: 18.3 },
  { id: 'lijiang', zh: '丽江', en: 'Lijiang', pinyin: 'lijiang', provinceZh: '云南省', provinceEn: 'Yunnan', longitude: 100.2, latitude: 26.9 },

  // 国际城市 — 亚洲
  { id: 'tokyo', zh: '东京', en: 'Tokyo', pinyin: 'dongjing', provinceZh: '日本', provinceEn: 'Japan', longitude: 139.7, latitude: 35.7 },
  { id: 'seoul', zh: '首尔', en: 'Seoul', pinyin: 'shouer', provinceZh: '韩国', provinceEn: 'South Korea', longitude: 127.0, latitude: 37.6 },
  { id: 'singapore', zh: '新加坡', en: 'Singapore', pinyin: 'xinjiapo', provinceZh: '新加坡', provinceEn: 'Singapore', longitude: 103.9, latitude: 1.4 },
  { id: 'kualalumpur', zh: '吉隆坡', en: 'Kuala Lumpur', pinyin: 'jilongpo', provinceZh: '马来西亚', provinceEn: 'Malaysia', longitude: 101.7, latitude: 3.1 },
  { id: 'bangkok', zh: '曼谷', en: 'Bangkok', pinyin: 'mangu', provinceZh: '泰国', provinceEn: 'Thailand', longitude: 100.5, latitude: 13.8 },
  { id: 'jakarta', zh: '雅加达', en: 'Jakarta', pinyin: 'yajiada', provinceZh: '印度尼西亚', provinceEn: 'Indonesia', longitude: 106.8, latitude: -6.2 },
  { id: 'manila', zh: '马尼拉', en: 'Manila', pinyin: 'manila', provinceZh: '菲律宾', provinceEn: 'Philippines', longitude: 121.0, latitude: 14.6 },
  { id: 'hanoi', zh: '河内', en: 'Hanoi', pinyin: 'henei', provinceZh: '越南', provinceEn: 'Vietnam', longitude: 105.8, latitude: 21.0 },

  // 国际城市 — 澳大利亚 & 新西兰
  { id: 'sydney', zh: '悉尼', en: 'Sydney', pinyin: 'xini', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 151.2, latitude: -33.9 },
  { id: 'melbourne', zh: '墨尔本', en: 'Melbourne', pinyin: 'moerben', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 145.0, latitude: -37.8 },
  { id: 'brisbane', zh: '布里斯班', en: 'Brisbane', pinyin: 'bulisiban', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 153.0, latitude: -27.5 },
  { id: 'perth', zh: '珀斯', en: 'Perth', pinyin: 'posi', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 115.9, latitude: -31.9 },
  { id: 'adelaide', zh: '阿德莱德', en: 'Adelaide', pinyin: 'adelaide', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 138.6, latitude: -34.9 },
  { id: 'canberra', zh: '堪培拉', en: 'Canberra', pinyin: 'kanpeila', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 149.1, latitude: -35.3 },
  { id: 'hobart', zh: '霍巴特', en: 'Hobart', pinyin: 'huobate', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 147.3, latitude: -42.9 },
  { id: 'darwin', zh: '达尔文', en: 'Darwin', pinyin: 'daerwen', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 130.8, latitude: -12.5 },
  { id: 'goldcoast', zh: '黄金海岸', en: 'Gold Coast', pinyin: 'huangjinhaian', provinceZh: '澳大利亚', provinceEn: 'Australia', longitude: 153.4, latitude: -28.0 },
  { id: 'auckland', zh: '奥克兰', en: 'Auckland', pinyin: 'aokelan', provinceZh: '新西兰', provinceEn: 'New Zealand', longitude: 174.8, latitude: -36.8 },
  { id: 'wellington', zh: '惠灵顿', en: 'Wellington', pinyin: 'huilingdun', provinceZh: '新西兰', provinceEn: 'New Zealand', longitude: 174.8, latitude: -41.3 },

  // 国际城市 — 欧美
  { id: 'newyork', zh: '纽约', en: 'New York', pinyin: 'niuyue', provinceZh: '美国', provinceEn: 'USA', longitude: -74.0, latitude: 40.7 },
  { id: 'losangeles', zh: '洛杉矶', en: 'Los Angeles', pinyin: 'luoshanji', provinceZh: '美国', provinceEn: 'USA', longitude: -118.2, latitude: 34.1 },
  { id: 'sanfrancisco', zh: '旧金山', en: 'San Francisco', pinyin: 'jiujinshan', provinceZh: '美国', provinceEn: 'USA', longitude: -122.4, latitude: 37.8 },
  { id: 'london', zh: '伦敦', en: 'London', pinyin: 'lundun', provinceZh: '英国', provinceEn: 'UK', longitude: -0.1, latitude: 51.5 },
  { id: 'paris', zh: '巴黎', en: 'Paris', pinyin: 'bali', provinceZh: '法国', provinceEn: 'France', longitude: 2.4, latitude: 48.9 },
  { id: 'vancouver', zh: '温哥华', en: 'Vancouver', pinyin: 'wengehua', provinceZh: '加拿大', provinceEn: 'Canada', longitude: -123.1, latitude: 49.3 },
  { id: 'toronto', zh: '多伦多', en: 'Toronto', pinyin: 'duolunduo', provinceZh: '加拿大', provinceEn: 'Canada', longitude: -79.4, latitude: 43.7 },
];
