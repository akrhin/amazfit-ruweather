    /*
    ** Watch_Face_Editor tool v 18.1
    ** watchface js version v2.1.1
    ** Copyright © SashaCX75. All Rights Reserved
    */
   
    try {
    (() => {
        //start of ignored block
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        const __$$module$$__ = __$$app$$__.current;
        const h = new DeviceRuntimeCore.WidgetFactory(new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__));
        const {px} = __$$app$$__.__globals__;
        //const logger = Logger.getLogger('watchface_SashaCX75');

        //dynamic modify start

        
        let normal_background_bg_img = ''
        let normal_system_disconnect_img = ''
        let normal_system_clock_img = ''
        let normal_spo2_text_text_img = ''
        let normal_humidity_text_text_img = ''
        let normal_humidity_image_progress_img_level = ''
        let normal_city_name_text = ''
        let normal_weather_image_progress_img_level = ''
        let normal_temperature_current_text_img = ''
        let normal_calorie_current_text_img = ''
        let normal_pressure_text_text_img = ''
        let normal_step_image_progress_img_level = ''
        let normal_step_current_text_img = ''
        let normal_distance_text_text_img = ''
        let normal_date_img_date_day = ''
        let normal_date_img_date_month = ''
        let normal_date_img_date_year = ''
        let normal_heart_rate_image_progress_img_level = ''
        let normal_heart_rate_text_text_img = ''
        let normal_heart_rate_text_separator_img = ''
        let normal_digital_clock_img_time = ''
        let normal_date_img_date_week_img = ''
        let normal_battery_image_progress_img_level = ''
        let idle_moon_image_progress_img_level = ''
        //dynamic modify end

        // RuWeather integration start
        // RuWeather stores data in weather.json and forecast.json
        // See: https://starrrscream.github.io/website/
        
        // ID из app.json
        const MINI_APP_ID = 1130622;
        
        // Массив возможных путей к weather.json (попытки найти файл RuWeather)
        const WEATHER_PATHS = [
          "weather.json",                           // Корень (попытка 1)
          "/weather.json",                          // Абсолютный корень (попытка 2)
          "/RuWeather/weather.json",                // Папка RuWeather (попытка 3)
          "/appweather/weather.json",               // Альтернативная папка (попытка 4)
          "/data/weather.json",                     // Данные (попытка 5)
        ];
        
        // Отладочная информация
        console.log('RuWeather mod: Using mini_app_id = ' + MINI_APP_ID);
        console.log('RuWeather mod: Trying ' + WEATHER_PATHS.length + ' possible file paths');
        
        // Попытка прочитать файл из конкретного пути
        // Возвращает строку или пустую строку
        function tryReadWeatherFile(path) {
          let result = "";
          try {
            const [fs_stat, err] = hmFS.stat(path, {
              appid: MINI_APP_ID
            });
            if (err == 0 && fs_stat) {
              const fh = hmFS.open(path, hmFS.O_RDONLY, {
                appid: MINI_APP_ID
              })
              if (fh) {
                const len = fs_stat.size;
                let array_buffer = new ArrayBuffer(len);
                hmFS.read(fh, array_buffer, 0, len);
                hmFS.close(fh);
                result = arrayBufferToCyrillic(array_buffer);
                console.log('RuWeather mod: Successfully read from:', path, '- size:', len);
              }
            } else {
              //console.log('RuWeather mod: File not found at:', path, 'err:', err);
            }
          } catch (e) {
            console.log('RuWeather mod: Error reading', path, ':', e.message);
          }
          return result;
        }
        
        function arrayBufferToCyrillic(buffer) {
          let result = '';
          const bytes = new Uint8Array(buffer);

          let i = 0;
          while (i < bytes.length) {
            let byte1 = bytes[i++];

            // Обработка 1-байтовых символов (ASCII)
            if (byte1 < 0x80) {
              result += String.fromCharCode(byte1);
            }
            // Обработка 2-байтовых символов (UTF-8 кодировка для кириллицы)
            else if (byte1 >= 0xC0 && byte1 < 0xE0) {
              let byte2 = bytes[i++];
              let charCode = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
              result += String.fromCharCode(charCode);
            }
            // Обработка 3-байтовых символов (например, для UTF-8)
            else if (byte1 >= 0xE0 && byte1 < 0xF0) {
              let byte2 = bytes[i++];
              let byte3 = bytes[i++];
              let charCode = ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F);
              result += String.fromCharCode(charCode);
            }
          }

          return result;
        }

        function read_weather_data_str() {
          console.log('start read weather data');
          let str_result = "";
          
          // Пробуем каждый путь до первого успеха
          for (const path of WEATHER_PATHS) {
            const read_str = tryReadWeatherFile(path);
            if (read_str && read_str.length > 10) { // Минимальный размер для валидного JSON
              str_result = read_str;
              console.log('RuWeather mod: Found weather data at:', path);
              break;
            }
          }
          
          if (!str_result) {
            // Финальная попытка: попробуем прочитать любой .json файл в корне
            try {
              const [fs_stat, err] = hmFS.stat("", {
                appid: MINI_APP_ID
              });
              // Если корневая stat сработает, ищем файлы
              console.log('RuWeather mod: No specific path worked, trying fallback');
            } catch (e) {
              console.log('RuWeather mod: Fallback error:', e);
            }
          }
          
          return str_result;
        }

        function getWeatherValue(str = "", key) {
          let value = 0;
          try {
            const data = JSON.parse(str); //получаем массив данных
            //присваиваем виджетам их значения
            if (data[key] !== undefined) {
              value = data[key];
            }
          } catch (error) {
            console.log('error:', error);
            // Попытка ручного извлечения
            try {
              // Если JSON parse не сработал, пробуем найти похожие паттерны
              console.log('Trying manual parse for key:', key);
            } catch (e) {
              console.log('Manual parse also failed:', e);
            }
          }
          return value;
        }

        function getDataValue(str = "") {
          let value = 0;
          try {
            const data = JSON.parse(str); //получаем массив данных
            //присваиваем виджетам их значения
            // Безопасное получение свойств с fallback
            const temp = data.temperature !== undefined ? Number(data.temperature) : null;
            const city = data.city !== undefined ? String(data.city) : 'Unknown';
            const weatherTime = data.weatherTimeStr !== undefined ? String(data.weatherTimeStr) : '---';
            
            if (temp !== null) {
              normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, temp + '°') //присваиваем виджетам их значений
            } else {
              normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'N/A°')
            }
            if (city) {
              wCity.setProperty(hmUI.prop.TEXT, city);
            } else {
              wCity.setProperty(hmUI.prop.TEXT, 'City');
            }
            
            if (weatherTime) {
              wUpdate.setProperty(hmUI.prop.TEXT, weatherTime)
            } else {
              wUpdate.setProperty(hmUI.prop.TEXT, '---')
            }

          } catch (error) {
            console.log('error in getDataValue:', error);
            // В случае ошибки показываем placeholder, а не падаем
            normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'Err°');
            wCity.setProperty(hmUI.prop.TEXT, 'Err');
            wUpdate.setProperty(hmUI.prop.TEXT, 'Err');
          }
        }

        function updateWeatherApp() {
          console.log('update_weather_from_app START');
          let read_str = read_weather_data_str();
          console.log('read_str length:', read_str ? read_str.length : 0, 'content preview:', read_str ? read_str.substring(0, 50) : 'empty');
          
          if (read_str && read_str.length > 10) {
            try {
              getDataValue(read_str);
              console.log('update_weather_from_app: Success - weather displayed');
            } catch (e) {
              console.log('update_weather_from_app: Error in getDataValue:', e);
              // Показываем ошибку, но не даем черному экрану
              normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'Err°');
              wCity.setProperty(hmUI.prop.TEXT, 'Err');
              wUpdate.setProperty(hmUI.prop.TEXT, 'Err');
            }
          } else {
            console.log('update_weather_from_app: No weather data found - showing placeholder');
            // Показываем placeholder вместо черного экрана
            normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'No WP°');
            wCity.setProperty(hmUI.prop.TEXT, 'No WP');
            wUpdate.setProperty(hmUI.prop.TEXT, '---');
          }
        }
        // RuWeather integration end

        //#endregion
        function scale_call() {
          console.log('scale_call()');

              // Use RuWeather data instead of built-in weather sensor
              updateWeatherApp();
              
              /* Old code - using weather sensor
              console.log('Weather city name');
              let weatherData = weatherSensor.getForecastWeather();
              let normal_cityNameStr = weatherData.cityName;
              normal_cityNameStr = normal_cityNameStr.toUpperCase();
              normal_city_name_text.setProperty(hmUI.prop.TEXT, normal_cityNameStr);
              */
        };

        const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
          resume_call: (function () {
            console.log('resume_call()');
            scale_call();
            text_update();
            if (screenType == hmSetting.screen_type.AOD) {
              if (!idle_timerTextUpdate) {
                idle_timerTextUpdate = timer.createTimer(0, 1000, (function (option) {
                  text_update();
                }));  // end timer 
              };  // end timer check
            };  // end screenType