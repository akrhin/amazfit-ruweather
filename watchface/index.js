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
        
        // Используем ID из app.json для доступа к файлам
        const MINI_APP_ID = 1130622;
        
        // Отладочная информация
        console.log('RuWeather mod: Using mini_app_id = ' + MINI_APP_ID);
        
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
          try {
            // Пытаемся найти weather.json в разных локациях
            const file_name = "weather.json";
            const mini_app_id = MINI_APP_ID;

            // Сначала проверяем наличие файла
            let fs_stat, err;
            try {
              [fs_stat, err] = hmFS.stat(file_name, {
                appid: mini_app_id
              });
            } catch (e) {
              console.log('hmFS.stat error:', e);
              fs_stat = null;
              err = -1;
            }
            
            if (err == 0 && fs_stat) {
              //console.log('--->size_alt:', fs_stat.size);

              let fh;
              try {
                fh = hmFS.open(file_name, hmFS.O_RDONLY, {
                  appid: mini_app_id
                })
              } catch (e) {
                console.log('hmFS.open error:', e);
                // Пробуем альтернативный путь
                try {
                  fh = hmFS.open("/" + file_name, hmFS.O_RDONLY, {
                    appid: mini_app_id
                  })
                } catch (e2) {
                  console.log('alt open error:', e2);
                  fh = null;
                }
              }
              
              if (fh) {
                const len = fs_stat.size;
                let array_buffer = new ArrayBuffer(len);
                try {
                  hmFS.read(fh, array_buffer, 0, len);
                  hmFS.close(fh);
                  str_result = arrayBufferToCyrillic(array_buffer);
                  //console.log(`str_result = ${str_result}`);
                } catch (e) {
                  console.log('hmFS.read error:', e);
                }
              }
            } else {
              console.log('File not found or err:', err)
              
              // Попытка прочитать из-known RuWeather path
              try {
                const [alt_stat, alt_err] = hmFS.stat("/RuWeather/weather.json", {
                  appid: mini_app_id
                });
                if (alt_err == 0 && alt_stat) {
                  console.log('Found weather.json at /RuWeather/');
                  const alt_fh = hmFS.open("/RuWeather/weather.json", hmFS.O_RDONLY, {
                    appid: mini_app_id
                  });
                  const alt_len = alt_stat.size;
                  let alt_array_buffer = new ArrayBuffer(alt_len);
                  hmFS.read(alt_fh, alt_array_buffer, 0, alt_len);
                  hmFS.close(alt_fh);
                  str_result = arrayBufferToCyrillic(alt_array_buffer);
                }
              } catch (e) {
                console.log('Alt path error:', e);
              }
            }

          } catch (error) {
            console.log('error:', error);
            console.log("FAIL: No access to hmFS.");
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
            // Попробуем альтернативный парсинг
            try {
              // Пытаемся извлечь значения regexp-ом или ручным парсингом
              console.log('Trying alternative parse');
            } catch (e) {
              console.log('Alt parse also failed:', e);
            }
          }
          return value;
        }

        function getDataValue(str = "") {
          let value = 0;
          try {
            const data = JSON.parse(str); //получаем массив данных
            //присваиваем виджетам их значения
            if (data.temperature !== undefined) {
              normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, (data.temperature || 0) + '°') //присваиваем виджетам их значений
            } else {
              normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'N/A°')
            }
            if (data.idle_temperature !== undefined) {
              idle_temperature_current_text_font.setProperty(hmUI.prop.TEXT, (data.idle_temperature || 0) + '°')
            }

            // Выводим город с безопасным преобразованием
            if (data.city) {
              const cityStr = String(data.city);
              wCity.setProperty(hmUI.prop.TEXT, cityStr);
            } else {
              wCity.setProperty(hmUI.prop.TEXT, 'City---');
            }
            
            if (data.weatherTimeStr !== undefined) {
              wUpdate.setProperty(hmUI.prop.TEXT, data.weatherTimeStr)
            } else {
              wUpdate.setProperty(hmUI.prop.TEXT, '---')
            }

          } catch (error) {
            console.log('error in getDataValue:', error);
            // В случае ошибки показываем placeholder
            normal_temperature_current_text_font.setProperty(hmUI.prop.TEXT, 'Err°');
            wCity.setProperty(hmUI.prop.TEXT, 'Err');
            wUpdate.setProperty(hmUI.prop.TEXT, 'Err');
          }
        }

        function updateWeatherApp() {
          console.log('update_weather_from_app')
          let read_str = read_weather_data_str();
          console.log('read_str length:', read_str.length, 'content:', read_str.substring(0, 100));
          getDataValue(read_str);
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