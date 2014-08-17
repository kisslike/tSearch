var get_lang = function (lang) {
    var lang_arr_en = {
        t: 'en',

        categoryFilms: 'Films',
        categorySerials: 'Serials',
        categoryAnime: 'Anime',
        categoryDocHum: 'Doc. and humor',
        categoryMusic: 'Music',
        categoryGames: 'Games',
        categoryBooks: 'Books',
        categoryCartoons: 'Cartoons',
        categorySoft: 'Software',
        categorySport: 'Sport',
        categoryXXX: 'XXX',
        categoryOther: 'Other',
        categoryAll: 'All',

        search_btn: 'Search',
        btn_main: 'Main',
        btn_history: 'Search history',
        btn_up: 'Up!',
        tracker_list: 'Trackers',
        setup_btn: 'Setup',
        word_filter: 'Word filter',
        clear_btn: 'Clear',
        size_filter: 'Size filter',
        word_from: 'from',
        word_to: 'to',
        size_filter_g: 'Gb',

        columnTime: 'Date',
        columnQualityShort: 'Q',
        columnQuality: 'Quality',
        columnTitle: 'Title',
        columnSize: 'Size',
        columnSeedsShort: 'S',
        columnSeeds: 'Seeders',
        columnLeechsShort: 'P',
        columnLeechs: 'Peers',

        btn_login: 'Login',
        size_list: '["b","Kb","Mb","Gb","Tb","Pb","Eb","Zb","Yb"]',

        time_yest: 'Yesterday',
        time_today: 'Today',
        time_week1: 'week',
        time_week2: 'week',
        time_week3: 'weeks',
        time_week4: 'week',
        time_day1: 'day',
        time_day2: 'day',
        time_day3: 'days',
        time_day4: 'day',
        time_hour1: 'hour',
        time_hour2: 'hour',
        time_hour3: 'hours',
        time_hour4: 'hour',
        time_min: 'min.',
        time_sec: 'sec',
        time_old: 'ago',

        exp_btn_sync: 'Update',
        exp_btn_open: 'Open site',

        exp_items_favorites: 'Favorites',
        exp_items_kp_favorites: 'Kinopoisk: Favorites',
        exp_items_kp_in_cinema: 'Now in the movie',
        exp_items_kp_popular: 'Movies',
        exp_items_kp_serials: 'TV Series',
        exp_items_imdb_in_cinema: 'IMDB: Now in the movie',
        exp_items_imdb_popular: 'IMDB: Movies',
        exp_items_imdb_serials: 'IMDB: TV Series',
        exp_items_gg_games_top: 'Games: Best',
        exp_items_gg_games_new: 'Games: New',

        exp_setup_view: 'Setup view',
        exp_in_fav: 'Add to favorites',
        exp_rm_fav: 'Remove from favorites',
        exp_edit_fav: 'Edit poster',
        exp_move_fav: 'Move poster',
        exp_edit_fav_label0: 'Enter new name',
        exp_edit_fav_label1: 'Image url',
        exp_edit_fav_label2: 'Description url',
        exp_more: 'More',
        exp_default: 'Default',
        his_title: 'Search history',
        his_h1: 'History',
        his_no_his: 'The search history yet',
        his_rm_btn: 'Remove',
        y_money: 'Yandex Money',
        donate: 'Donate me!',
        ctx_title: 'Search torrent',
        label_profile: 'Profile',
        label_def_profile: 'Default',
        exp_q_fav: 'Get quality',

        flag_cirilic: 'Unsupport cyrillic',
        flag_auth: 'Requires authorization',
        flag_rus: 'Russian language tracker',
        flag_proxy: 'Search via proxy',

        apprise_btns0: 'Ok',
        apprise_btns1: 'Cancel',
        time_filter: 'Date filter',

        time_f_s_all:'For all the time',
        time_f_s_1h:'For an hour',
        time_f_s_24h:'For the day',
        time_f_s_72h:'For the 3 day',
        time_f_s_1w:'For the week',
        time_f_s_1m:'For the month',
        time_f_s_1y:'For the year',
        time_f_s_range:'For the period...',

        time_f_d: '["su","mo","tu","we","th","fr","sa"]',
        time_f_m: '["January","February","March","April","May","June","July","August","September","October","November","December"]',

        seed_filter: "Seeds",
        peer_filter: "Peers",
        settings_saved: "Saved!",
        trackerNotFound: "Tracker not found!",
        findNotFound: "To find!",
        feedback: 'Feedback',

        word_add: 'Add...',
        editTrackerList: 'Edit tracker list',
        mgrTitleNew: 'Add a new tracker list',
        mgrTitleEdit: 'Editing a list of trackers',
        word_close: 'Close',
        mgrNewListName: 'Name',
        mgrRemoveList: 'Delete list',
        word_all: 'All',
        mgtWithoutList: 'Without a list',
        word_selected: 'Selected',
        mgrQuickSearch: 'Quick search',
        mgrNothingSelected: 'Nothing is selected',
        mgrSelectedN: 'Selected items:',
        word_save: 'Save',
        mgrUseProxy: 'Use proxy',
        advanced_options: 'Advanced options',

        external_tracker: 'External',
        add_custom_code: 'Add',
        create_custom_code: 'Create',
        external_html: 'Add external trackers from the <a href="http://code-tms.blogspot.ru/" target="_blank">official website</a>!',
        custom_tracker_edit: 'Edit',
        custom_tracker_remove: 'Delete',
        enter_tracker_code: 'Copy and paste the tracker code:',

        optMain: 'General',
        optMainPage: 'Main page',
        optOther: 'Other',
        word_backup: 'Backup',
        word_restore: 'Restore',
        word_to_restore: 'Restore',
        optHideTrackerIcons: 'Hide icons trackers in search results',
        optHideZeroSeed: 'Hide hand without seeds',
        optHidePeerColumn: 'Hide column "peers"',
        optHideSeedColumn: 'Hide column "seeds"',
        optEnableTeaserFilter: 'Hide teasers and trailers in search results',
        optDefineCategory: 'Trying to define the category',
        optEnableHighlight: 'To highlight the search results',
        optNoBlankPageOnDownloadClick: 'Do not open a new page when you click on the download link ↓',
        optAllowGetDescription: 'Find description of a search query',
        optContextMenu: 'Add search in the context menu',
        optSearchPopup: 'Do not show the search box when you click on the icon',
        optAutoComplite: 'Enable AutoComplete',
        optProfileListSync: 'To synchronize the tracker list',
        optRightPanel: 'Move the filter panel to the right',
        optDoNotSendStatistics: 'Do not send statistics',
        optUseEnglishPosterName: 'To display the names in English',
        optHideTopSearch: 'Hide the Top 40 search queries',
        optAllowFavoritesSync: 'Synchronize favorites list',
        optKinopoiskFolderId: 'ID category kinopoisk.ru site: ',
        optListFilter: 'Filtering the list',
        optAdvFiltration0: 'Looking for full match',
        optAdvFiltration1: 'Looking for a match with one of the words',
        optAdvFiltration2: 'Looking for a match all entered words',
        optSubCategoryFilter: 'Consider the subcategory',
        optProxyTitle: 'Proxying requests',
        optProxyInfo: 'Proxy only works for GET requests.',
        optProxyURL: 'URL',
        optProxyUrlFixSpaces: 'To escape spaces',
        word_update: 'Refresh',
        optSaveInCloud: 'Save in the cloud',
        optGetFromCloud: 'Get the settings from the cloud',
        optClearCloudStorage: 'Clear the settings in the cloud',

        magic_1: 'Loading error!',
        magic_2: "Search",
        magic_3: "Selectors",
        magic_4: "Convert",
        magic_5: "Authorization",
        magic_6: "Description",
        magic_7: "Get \\ Read code",
        magic_8: "Search results",
        magic_9: "The URL of the search results page",
        magic_10: "Open",
        magic_11: "The search request (query parameter using the variable %search%)",
        magic_12: "Convert Cyrillic in cp1251",
        magic_13: "POST request",
        magic_14: "Root url",
        magic_15: "Defining the login page",
        magic_16: "The URL of the login page",
        magic_17: "Open",
        magic_18: "Login form",
        magic_19: "Choose",
        magic_20: "Selectors",
        magic_21: "Row in a table",
        magic_22: "Name of category",
        magic_23: "Link to the category",
        magic_24: "Add the root url",
        magic_25: "The name of the torrent",
        magic_26: "Link to to the torrent-page",
        magic_27: "Add the root url",
        magic_28: "Torrent size",
        magic_29: "Torrent download link",
        magic_30: "Add the root url",
        magic_31: "Number of seeders",
        magic_32: "Number of peers",
        magic_33: "Torrent date",
        magic_34: "Skip the first n rows",
        magic_35: "Skip the last n rows",
        magic_36: "Convert",
        magic_37: "Torrent date",
        magic_38: "Apply regexp",
        magic_39: "replace to",
        magic_40: "Replace the name of the month by the number of",
        magic_41: "Convert time in Unix timestamp format from",
        magic_42: "The original string",
        magic_43: "Converted",
        magic_44: "Result",
        magic_45: "Torrent size",
        magic_46: "Convert",
        magic_47: "The original string",
        magic_48: "Converted",
        magic_49: "Description of the torrent tracker",
        magic_50: "base64 icon (16x16px)",
        magic_51: "Torrent name",
        magic_52: "Torrent description",
        magic_53: "Cyrillic support",
        magic_54: "Login required",
        magic_55: "Russian language tracker",
        magic_56: "Get \\ Read code",
        magic_57: "Get the code",
        magic_58: "Read the code",
        magic_59: "Seeds",
        magic_60: "Peers",
        magic_61: "Table",
        magic_62: "Attribute",
        magic_63: "Replace the words of today\\yesterday\\now",
        magic_64: "Page charset"
    };
    var lang_arr_ru = {
        t: 'ru',

        categoryFilms: 'Фильмы',
        categorySerials: 'Сериалы',
        categoryAnime: 'Анимэ',
        categoryDocHum: 'Док. и юмор',
        categoryMusic: 'Музыка',
        categoryGames: 'Игры',
        categoryBooks: 'Книги',
        categoryCartoons: 'Мультфильмы',
        categorySoft: 'ПО',
        categorySport: 'Спорт',
        categoryXXX: 'XXX',
        categoryOther: 'Прочее',
        categoryAll: 'Всё',

        search_btn: 'Найти',
        btn_main: 'Главная',
        btn_history: 'История поиска',
        btn_up: 'Вверх!',
        tracker_list: 'Трекеры',
        setup_btn: 'Настройки',
        word_filter: 'Фильтр слов',
        clear_btn: 'Очистить',
        size_filter: 'Размер',
        word_from: 'от',
        word_to: 'до',
        size_filter_g: 'Гб',

        columnTime: 'Добавлено',
        columnQualityShort: 'К',
        columnQuality: 'Качество',
        columnTitle: 'Название',
        columnSize: 'Размер',
        columnSeedsShort: 'С',
        columnSeeds: 'Сиды (Раздают)',
        columnLeechsShort: 'П',
        columnLeechs: 'Пиры (Скачивают)',

        btn_login: 'Войти',
        size_list: '["б","Кб","Мб","Гб","Тб","Пб","Eb","Zb","Yb"]',


        time_yest: 'Вчера',
        time_today: 'Сегодня',
        time_week1: 'недель',
        time_week2: 'неделя',
        time_week3: 'недели',
        time_week4: 'недель',
        time_day1: 'дней',
        time_day2: 'день',
        time_day3: 'дня',
        time_day4: 'дней',
        time_hour1: 'часов',
        time_hour2: 'час',
        time_hour3: 'часа',
        time_hour4: 'часов',
        time_min: 'мин.',
        time_sec: 'сек',
        time_old: 'назад',

        exp_btn_sync: 'Обновить',
        exp_btn_open: 'Перейти на сайт',

        exp_items_favorites: 'Избранное',
        exp_items_kp_favorites: 'Кинопоиск: Избранное',
        exp_items_kp_in_cinema: 'Сейчас в кино',
        exp_items_kp_popular: 'Фильмы',
        exp_items_kp_serials: 'Сериалы',
        exp_items_imdb_in_cinema: 'IMDB: Сейчас в кино',
        exp_items_imdb_popular: 'IMDB: Фильмы',
        exp_items_imdb_serials: 'IMDB: Сериалы',
        exp_items_gg_games_top: 'Игры: Лучшие',
        exp_items_gg_games_new: 'Игры: Новые',

        exp_setup_view: 'Настроить вид',
        exp_in_fav: 'В избранное',
        exp_rm_fav: 'Удалить из избранного',
        exp_edit_fav: 'Редактировать постер',
        exp_move_fav: 'Переместить',

        exp_edit_fav_label0: 'Введите новое имя',
        exp_edit_fav_label1: 'URL изображения',
        exp_edit_fav_label2: 'URL описания',

        exp_more: 'Подробнее',
        exp_default: 'По умолчанию',
        his_title: 'История поиска',
        his_h1: 'История',
        his_no_his: 'Истории поиска пока нет',
        his_rm_btn: 'Удалить',
        y_money: 'Яндекс Деньги',
        donate: 'На жвачку!',
        ctx_title: 'Найти торрент',
        label_profile: 'Профиль',
        label_def_profile: 'Стандартный',
        exp_q_fav: 'Узнать качество',

        flag_cirilic: 'Не поддерживает кириллицу',
        flag_auth: 'Требуется авторизация',
        flag_rus: 'Русскоязычный трекер',
        flag_proxy: 'Искать через proxy',

        apprise_btns0: 'Готово',
        apprise_btns1: 'Отменить',
        time_filter: 'Дата',

        time_f_s_all:'За всё время',
        time_f_s_1h:'За час',
        time_f_s_24h:'За сутки',
        time_f_s_72h:'За 3-е суток',
        time_f_s_1w:'За неделю',
        time_f_s_1m:'За месяц',
        time_f_s_1y:'За год',
        time_f_s_range:'За период...',

        time_f_d: '["вс","пн","вт","ср","чт","пт","сб"]',
        time_f_m: '["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]',

        seed_filter: "Сиды",
        peer_filter: "Пиры",
        settings_saved: "Сохранено!",
        trackerNotFound: "Трекер не найден!",
        findNotFound: "Найти!",
        feedback: 'Сообщить о проблеме...',

        word_add: 'Добавить...',
        editTrackerList: 'Редактировать список трекеров',
        mgrTitleNew: 'Добавление нового списка трекеров',
        mgrTitleEdit: 'Редактирование списка трекеров',
        word_close: 'Закрыть',
        mgrNewListName: 'Название списка',
        mgrRemoveList: 'Удалить список',
        word_all: 'Все',
        mgtWithoutList: 'Без списка',
        word_selected: 'Выбранные',
        mgrQuickSearch: 'Быстрый поиск',
        mgrNothingSelected: 'Ничего не выбрано',
        mgrSelectedN: 'Выбрано элементов:',
        word_save: 'Сохранить',
        mgrUseProxy: 'Использовать прокси',
        advanced_options: 'Расширенные опции',

        external_tracker: 'Внешние',
        add_custom_code: 'Добавить',
        create_custom_code: 'Создать',
        external_html: 'Добавь внешние трекеры с <a href="http://code-tms.blogspot.ru/" target="_blank">официального сайта</a>!',
        custom_tracker_edit: 'Редактировать',
        custom_tracker_remove: 'Удалить',
        enter_tracker_code: 'Скопируйте и вставьте код трекера:',

        optMain: 'Общие',
        optMainPage: 'Главная страница',
        optOther: 'Прочие',
        word_backup: 'Архивирование',
        word_restore: 'Восстановление',
        word_to_restore: 'Восстановить',
        optHideTrackerIcons: 'Скрыть иконки трекеров в результатах поиска',
        optHideZeroSeed: 'Скрыть раздачи без сидов (раздающих)',
        optHidePeerColumn: 'Скрыть столбец "пиры" (скачивающие)',
        optHideSeedColumn: 'Скрыть столбец "сиды" (раздающих)',
        optEnableTeaserFilter: 'Скрыть тизеры и трейлеры в результатах поиска',
        optDefineCategory: 'Пытаться определить категорию',
        optSubSelectEnable: 'Подсвечивать результаты поиска',
        optNoBlankPageOnDownloadClick: 'Не открывать новую страницу при нажатии на ссылку скачать ↓',
        optAllowGetDescription: 'Искать описание поискового запроса',
        optContextMenu: 'Добавить поиск в контекстное меню',
        optSearchPopup: 'Не показывать поисковую строку при нажатии на иконку',
        optAutoComplite: 'Включить автозаполнение',
        optProfileListSync: 'Синхронизировать список трекеров',
        optRightPanel: 'Переместить панель фильтров вправо',
        optDoNotSendStatistics: 'Не отправлять статистику',
        optUseEnglishPosterName: 'Отображать названия на английском',
        optHideTopSearch: 'Скрыть Топ-40 поисковых запросов',
        optEnableFavoriteSync: 'Синхронизировать списка избранного',
        optKinopoiskFolderId: 'ID категории кинопоиска: ',
        optListFilter: 'Фильтрация списка',
        optAdvFiltration0: 'Ищет полное совпадение фразы',
        optAdvFiltration1: 'Ищет совпадение с одним из введенных слов',
        optAdvFiltration2: 'Ищет совпадение всех введенных слов',
        optSubCategoryFilter: 'Учитывать подкатегории',
        optProxyTitle: 'Проксирование запросов',
        optProxyInfo: 'Прокси работает только для GET запросов.',
        optProxyURL: 'URL',
        optProxyUrlFixSpaces: 'Экранировать пробелы',
        word_update: 'Обновить',
        optSaveInCloud: 'Сохранить в облаке',
        optGetFromCloud: 'Получить настройки из облака',
        optClearCloudStorage: 'Очистить настройки в облаке',

        magic_1: 'Ошибка загрузки!',
        magic_2: "Поиск",
        magic_3: "Селекторы",
        magic_4: "Конвертация",
        magic_5: "Авторизация",
        magic_6: "Описание",
        magic_7: "Получить \\ Прочитать код",
        magic_8: "Результаты поиска",
        magic_9: "URL страницы с результатами поиска",
        magic_10: "Открыть",
        magic_11: "Запрос поиска (в параметрах запроса используйте переменную %search%)",
        magic_12: "Конвертировать кириллицу в cp1251",
        magic_13: "POST запрос",
        magic_14: "Основной url",
        magic_15: "Определение страницы авторизации",
        magic_16: "URL страницы входа",
        magic_17: "Открыть",
        magic_18: "Форма входа",
        magic_19: "Выбрать",
        magic_20: "Селекторы",
        magic_21: "Строка в таблице",
        magic_22: "Название категории",
        magic_23: "Ссылка на категорию",
        magic_24: "Добавить основной url",
        magic_25: "Название раздачи",
        magic_26: "Ссылка на раздачу",
        magic_27: "Добавить основной url",
        magic_28: "Размер раздачи",
        magic_29: "Ссылка на скачку раздачи",
        magic_30: "Добавить основной url",
        magic_31: "Количество сидов",
        magic_32: "Количество пиров",
        magic_33: "Дата добавления раздачи",
        magic_34: "Пропустить первые n строк",
        magic_35: "Пропустить последнии n строк",
        magic_36: "Конвертирование",
        magic_37: "Дата добавления раздачи",
        magic_38: "Применить regexp",
        magic_39: "заменить на",
        magic_40: "Заменить название месяца на число",
        magic_41: "Конвертировать время в Unix timestamp из формата",
        magic_42: "Исходная строка",
        magic_43: "Конвертированная",
        magic_44: "Итог",
        magic_45: "Размер торрента",
        magic_46: "Преобразовать",
        magic_47: "Исходная строка",
        magic_48: "Конвертированная",
        magic_49: "Описание торрент-трекера",
        magic_50: "base64 иконка (16x16px)",
        magic_51: "Название торрента",
        magic_52: "Описание торрента",
        magic_53: "Поддержка кириллицы",
        magic_54: "Требуется авторизация",
        magic_55: "Русскоязычный трекер",
        magic_56: "Получить \\ Прочитать код",
        magic_57: "Получить код",
        magic_58: "Прочитать код",
        magic_59: "Сиды",
        magic_60: "Пиры",
        magic_61: "Таблица",
        magic_62: "Атрибут",
        magic_63: "Заменить слова сегодня\\вчера\\сейчас",
        magic_64: "Кодировка страницы"
    };
    if (lang === 'ru') {
        return lang_arr_ru;
    } else {
        return lang_arr_en;
    }
};
if (typeof window === 'undefined') {
    exports.get_lang = get_lang;
}