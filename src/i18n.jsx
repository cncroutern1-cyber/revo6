import { createContext, useCallback, useContext, useEffect, useState } from "react";

// The Uzbek text is the key. Each entry is [Russian, English]. A missing entry falls back to Uzbek.
const D = {
  "Ish kuzatuv": ["Учёт работ", "Job Tracker"],
  "Yuklanmoqda...": ["Загрузка...", "Loading..."],
  "Onlayn": ["Онлайн", "Online"],
  "Onlayn: {0}": ["Онлайн: {0}", "Online: {0}"],
  "Hozir tizimda": ["Сейчас в системе", "Currently online"],
  "Saqlandi": ["Сохранено", "Saved"],
  "Xato": ["Ошибка", "Error"],
  "Chiqish": ["Выйти", "Log out"],
  "Tizimdan chiqmoqchimisiz?": ["Вы хотите выйти из системы?", "Do you want to log out?"],
  "Bekor qilish": ["Отмена", "Cancel"],
  "Saqlash": ["Сохранить", "Save"],
  "O'chirish": ["Удалить", "Delete"],
  "Til": ["Язык", "Language"],
  "Sahifalar": ["Страницы", "Pages"],
  "Ishlar": ["Работы", "Jobs"],
  "Tugatilgan ishlar": ["Завершённые работы", "Finished jobs"],
  "Mijozlar": ["Клиенты", "Customers"],
  "Hisobot": ["Отчёт", "Report"],
  "Foydalanuvchilar": ["Пользователи", "Users"],
  "Navbatda": ["В очереди", "Queued"],
  "Chizilmoqda": ["Чертится", "Drawing"],
  "O'yilmoqda": ["Вырезается", "Carving"],
  "Tayyor": ["Готово", "Ready"],
  "Tugatilgan": ["Завершено", "Finished"],
  "To'lanmagan": ["Не оплачено", "Unpaid"],
  "Avans berilgan": ["Аванс внесён", "Advance paid"],
  "To'liq to'langan": ["Оплачено полностью", "Fully paid"],
  "To'langan": ["Оплачено", "Paid"],
  // Login
  "Mebel va naqsh ishlari hisobi. Davom etish uchun kiring.": ["Учёт мебельных и резных работ. Войдите, чтобы продолжить.", "Furniture and carving job tracking. Sign in to continue."],
  "Bosh sahifaga": ["На главную", "Home"],
  "Foydalanuvchi": ["Пользователь", "User"],
  "Tanlang...": ["Выберите...", "Select..."],
  "Parol": ["Пароль", "Password"],
  "Kirish": ["Войти", "Sign in"],
  "Ismingizni tanlang.": ["Выберите своё имя.", "Choose your name."],
  "Parolni kiriting.": ["Введите пароль.", "Enter your password."],
  "Parol noto'g'ri, yoki bu foydalanuvchi Supabase'da yaratilmagan.": ["Неверный пароль, либо этот пользователь не создан в Supabase.", "Wrong password, or this user has not been created in Supabase."],
  "Parolni yashirish": ["Скрыть пароль", "Hide password"],
  "Parolni ko'rsatish": ["Показать пароль", "Show password"],
  // Jobs board
  "Qidirish...": ["Поиск...", "Search..."],
  "Qidirish": ["Поиск", "Search"],
  "+ Yangi ish": ["+ Новая работа", "+ New job"],
  "Tozalash": ["Очистить", "Clear"],
  "Topilmadi": ["Не найдено", "Not found"],
  "Bo'sh": ["Пусто", "Empty"],
  "Ishni o'chirish": ["Удалить работу", "Delete job"],
  "\"{0}\" ishi hamma qurilmalardan o'chiriladi. Buni qaytarib bo'lmaydi.": ["Работа «{0}» будет удалена на всех устройствах. Это нельзя отменить.", "Job \"{0}\" will be deleted from all devices. This cannot be undone."],
  "Tayyor ishlarni tozalash": ["Очистить готовые работы", "Clear ready jobs"],
  "Tayyor ustunidagi {0} ta ish hamma qurilmalardan o'chiriladi. Buni qaytarib bo'lmaydi.": ["{0} раб. из колонки «Готово» будут удалены на всех устройствах. Это нельзя отменить.", "{0} jobs in the Ready column will be deleted from all devices. This cannot be undone."],
  "Hammasini o'chirish": ["Удалить все", "Delete all"],
  // Card
  "{0} ta detal": ["Деталей: {0}", "{0} parts"],
  "Muddat: {0}": ["Срок: {0}", "Due: {0}"],
  "{0} kun kechikdi": ["Просрочено на {0} дн.", "{0} days late"],
  "Bugun topshiriladi": ["Сдать сегодня", "Due today"],
  "{0} kun qoldi": ["Осталось {0} дн.", "{0} days left"],
  "Qarz: {0}": ["Долг: {0}", "Debt: {0}"],
  "Orqaga": ["Назад", "Back"],
  "Yuqoriga": ["Вверх", "Up"],
  "Pastga": ["Вниз", "Down"],
  "Telegram orqali xabar": ["Сообщение через Telegram", "Message via Telegram"],
  "Telegram xabar": ["Сообщение в Telegram", "Telegram message"],
  "Xabar": ["Сообщение", "Message"],
  "Tahrirlash": ["Редактировать", "Edit"],
  "Keyingi bosqich": ["Следующий этап", "Next stage"],
  "Tugatilgan ishlarga o'tkazish": ["Перенести в завершённые", "Move to finished jobs"],
  "Tugatildi: Tugatilgan ishlar sahifasiga o'tkazish": ["Готово: перенести на страницу «Завершённые работы»", "Done: move to the Finished jobs page"],
  // Job form
  "Yangi ish": ["Новая работа", "New job"],
  "Ishni tahrirlash": ["Редактирование работы", "Edit job"],
  "Ish nomi": ["Название работы", "Job name"],
  "Masalan: Oshxona eshiklari 3D": ["Например: кухонные двери 3D", "E.g. Kitchen doors 3D"],
  "Mijoz": ["Клиент", "Customer"],
  "Telefon": ["Телефон", "Phone"],
  "Detallar soni": ["Количество деталей", "Number of parts"],
  "Material bizdan beriladi": ["Материал предоставляем мы", "Material supplied by us"],
  "Material narxi (so'm)": ["Стоимость материала (сум)", "Material price (UZS)"],
  "Rover xizmati narxi (so'm / m²)": ["Цена услуги Rover (сум / м²)", "Rover service price (UZS / m²)"],
  "Xizmat narxi": ["Стоимость услуги", "Service price"],
  "Jami narx": ["Итого", "Total price"],
  "material": ["материал", "material"],
  "PDF yuklab olish": ["Скачать PDF", "Download PDF"],
  "Rover xizmati": ["Услуга Rover", "Rover service"],
  "bizdan": ["от нас", "ours"],
  "Qabul qilingan sana": ["Дата приёма", "Date received"],
  "Oq": ["Белый", "White"],
  "Krem": ["Кремовый", "Cream"],
  "Bej": ["Бежевый", "Beige"],
  "Tabiiy yog'och": ["Натуральное дерево", "Natural wood"],
  "Jigarrang": ["Коричневый", "Brown"],
  "Qora": ["Чёрный", "Black"],
  "Kul rang": ["Серый", "Grey"],
  "Oltin": ["Золотой", "Gold"],
  "Rangi": ["Цвет", "Color"],
  "Yoki rangni o'zingiz yozing": ["Или впишите цвет сами", "Or type your own color"],
  "Fayl biriktirish": ["Прикрепить файл", "Attach file"],
  "Fayl tanlash": ["Выбрать файл", "Choose file"],
  "Fayl": ["Файл", "File"],
  "Fayl 20 MB dan katta": ["Файл больше 20 МБ", "File is larger than 20 MB"],
  "Yuklab bo'lmadi": ["Не удалось загрузить", "Upload failed"],
  "Material narxi (so'm / m²)": ["Цена материала (сум / м²)", "Material price (UZS / m²)"],
  "Material narxi": ["Стоимость материала", "Material cost"],
  "Ro'yxatdagi narx": ["Цена из списка", "List price"],
  "Narxni ro'yxatga saqlash": ["Сохранить цену в список", "Save price to list"],
  "Detallar": ["Детали", "Parts"],
  "Material turi": ["Тип материала", "Material type"],
  "Narx": ["Цена", "Price"],
  "Rover xizmati narxi": ["Цена услуги Rover", "Rover service price"],
  "Kvadratiga qarab": ["По площади (м²)", "By area (m²)"],
  "Listiga qarab": ["По листам", "By sheet"],
  "Qo'lda": ["Вручную", "Manual"],
  "1 m² narxi (so'm)": ["Цена 1 м² (сум)", "Price per 1 m² (UZS)"],
  "Listlar soni": ["Количество листов", "Number of sheets"],
  "1 list narxi (so'm)": ["Цена 1 листа (сум)", "Price per sheet (UZS)"],
  "list": ["лист.", "sheets"],
  "Eski usulda kiritilgan narx. Yangi hisob uchun yuqoridagi variantlardan birini tanlang.": ["Цена введена по-старому. Для нового расчёта выберите один из вариантов выше.", "Price entered the old way. Choose an option above for a new calculation."],
  "Yoki jami summa (so'm)": ["Или общая сумма (сум)", "Or total amount (UZS)"],
  "Muddat va holat": ["Срок и статус", "Deadline & status"],
  "Fayl va rasm": ["Файл и фото", "File & photo"],
  "Detallar kvadrati (m²)": ["Площадь деталей (м²)", "Parts area (m²)"],
  "Material": ["Материал", "Material"],
  "Tanlang yoki o'zingiz yozing": ["Выберите или впишите свой", "Pick or type your own"],
  "Qalinligi (mm)": ["Толщина (мм)", "Thickness (mm)"],
  "O'lcham": ["Размер", "Size"],
  "Masalan: 2100×600": ["Например: 2100×600", "E.g. 2100×600"],
  "Narx (so'm)": ["Цена (сум)", "Price (UZS)"],
  "Olingan avans (so'm)": ["Полученный аванс (сум)", "Advance received (UZS)"],
  "Qolgan to'lov:": ["Остаток к оплате:", "Remaining payment:"],
  "so'm": ["сум", "UZS"],
  "Avans narxdan {0} so'm ko'p. Summalarni tekshiring.": ["Аванс больше цены на {0} сум. Проверьте суммы.", "Advance exceeds the price by {0} UZS. Check the amounts."],
  "Topshirish muddati": ["Срок сдачи", "Due date"],
  "Bosqich": ["Этап", "Stage"],
  "Izoh": ["Примечание", "Note"],
  "Qo'shimcha eslatma": ["Дополнительная заметка", "Additional note"],
  "Rasm / chizma": ["Фото / чертёж", "Photo / drawing"],
  "Rasm tanlash": ["Выбрать фото", "Choose image"],
  "Olib tashlash": ["Убрать", "Remove"],
  "Rasm": ["Фото", "Image"],
  // Archive
  "Hali tugatilgan ish yo'q. \"Tayyor\" ustunidagi ish kartasida ✓ tugmasini bossangiz, ish shu yerga o'tadi.": ["Завершённых работ пока нет. Нажмите ✓ на карточке в колонке «Готово», и работа попадёт сюда.", "No finished jobs yet. Press ✓ on a card in the Ready column and the job will move here."],
  "Tugagan: {0}": ["Завершено: {0}", "Finished: {0}"],
  "{0} ta ish": ["Работ: {0}", "{0} jobs"],
  "Qaytarish": ["Вернуть", "Restore"],
  "Tayyor ustuniga qaytarish": ["Вернуть в колонку «Готово»", "Move back to Ready"],
  // Customers
  "Nomsiz": ["Без имени", "Unnamed"],
  "Hali mijozlar yo'q": ["Клиентов пока нет", "No customers yet"],
  "Qarz yo'q": ["Долга нет", "No debt"],
  " · jami {0} so'm": [" · всего {0} сум", " · total {0} UZS"],
  "Ishlar yo'q": ["Работ нет", "No jobs"],
  "Telefon raqami": ["Номер телефона", "Phone number"],
  "Qo'ng'iroq qilish": ["Позвонить", "Call"],
  // Report
  "Oy": ["Месяц", "Month"],
  "Shu oy tugatilgan ishlar": ["Завершено за месяц", "Finished this month"],
  "Shu oy qabul qilingan ishlar": ["Принято за месяц", "Received this month"],
  "Tugatilgan ishlar summasi (so'm)": ["Сумма завершённых работ (сум)", "Total of finished jobs (UZS)"],
  "Shundan olingan (so'm)": ["Из них получено (сум)", "Of which received (UZS)"],
  "Jami qarz (so'm)": ["Общий долг (сум)", "Total debt (UZS)"],
  "Jarayondagi ishlar": ["Работы в процессе", "Jobs in progress"],
  ", {0} tasi kechikkan": [", просрочено: {0}", ", {0} late"],
  "Shu oy eng ko'p ish bergan mijozlar": ["Клиенты с наибольшим числом работ за месяц", "Top customers this month"],
  "Bu oyda tugatilgan ish yo'q": ["В этом месяце завершённых работ нет", "No finished jobs this month"],
  "{0} ta · {1} so'm": ["{0} шт. · {1} сум", "{0} · {1} UZS"],
  "Ma'lumotlar": ["Данные", "Data"],
  "Excelga yuklab olish": ["Скачать в Excel", "Download for Excel"],
  "Zaxira nusxa": ["Резервная копия", "Backup"],
  "Zaxiradan yuklash": ["Загрузить из копии", "Restore from backup"],
  "Hammasini tozalash": ["Очистить всё", "Clear everything"],
  "{0} ta ish yuklanadi. Bir xil ishlar yangilanadi, qolganlari saqlanib qoladi. Davom etasizmi?": ["Будет загружено работ: {0}. Одинаковые обновятся, остальные сохранятся. Продолжить?", "{0} jobs will be loaded. Matching jobs are updated, the rest are kept. Continue?"],
  "Fayl noto'g'ri.": ["Неверный файл.", "Invalid file."],
  "Barcha ishlar va mijozlar hamma qurilmalardan o'chiriladi. Aniq o'chiraymi?": ["Все работы и клиенты будут удалены на всех устройствах. Точно удалить?", "All jobs and customers will be deleted from all devices. Are you sure?"],
  "Oxirgi marta so'rayman: qaytarib bo'lmaydi.": ["Последний раз спрашиваю: это нельзя отменить.", "Last time asking: this cannot be undone."],
  // Users
  "Server funksiyasi topilmadi. Supabase'da manage-users funksiyasini yarating (README).": ["Серверная функция не найдена. Создайте функцию manage-users в Supabase (README).", "Server function not found. Create the manage-users function in Supabase (README)."],
  "Ism va parolni kiriting.": ["Введите имя и пароль.", "Enter a name and password."],
  "\"{0}\" qo'shildi. Parol:": ["«{0}» добавлен. Пароль:", "\"{0}\" added. Password:"],
  "Yangi parolni kiriting.": ["Введите новый пароль.", "Enter the new password."],
  "\"{0}\" paroli o'zgartirildi. Yangi parol:": ["Пароль «{0}» изменён. Новый пароль:", "Password for \"{0}\" changed. New password:"],
  "\"{0}\" o'chirildi.": ["«{0}» удалён.", "\"{0}\" deleted."],
  "Parolni hozir nusxalab oling. Keyin uni ko'rib bo'lmaydi.": ["Скопируйте пароль сейчас. Потом его нельзя будет увидеть.", "Copy the password now. It cannot be viewed later."],
  "Nusxalash": ["Копировать", "Copy"],
  "Admin": ["Админ", "Admin"],
  "Ishchi": ["Работник", "Worker"],
  "Siz": ["Вы", "You"],
  "Parolni o'zgartirish": ["Сменить пароль", "Change password"],
  "Yangi parol (kamida 6 belgi)": ["Новый пароль (минимум 6 символов)", "New password (min. 6 characters)"],
  "Yangi parol": ["Новый пароль", "New password"],
  "Yangi foydalanuvchi qo'shish": ["Добавить пользователя", "Add a new user"],
  "Ism (login uchun)": ["Имя (для входа)", "Name (for login)"],
  "Masalan: Jasur": ["Например: Жасур", "E.g. Jasur"],
  "Vazifasi": ["Роль", "Role"],
  "Parol (kamida 6 belgi)": ["Пароль (минимум 6 символов)", "Password (min. 6 characters)"],
  "Qo'shish": ["Добавить", "Add"],
  "Foydalanuvchini o'chirish": ["Удалить пользователя", "Delete user"],
  "\"{0}\" tizimdan o'chiriladi va endi kira olmaydi. Uning kiritgan ishlari saqlanib qoladi.": ["«{0}» будет удалён из системы и больше не сможет войти. Введённые им работы сохранятся.", "\"{0}\" will be removed and can no longer sign in. Jobs they entered are kept."],
};

export const LANGS = [
  { id: "uz", label: "UZ", name: "O'zbekcha" },
  { id: "ru", label: "RU", name: "Русский" },
  { id: "en", label: "EN", name: "English" },
];

const KEY = "ish-kuzatuv-lang";
const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "uz" || v === "ru" || v === "en") return v;
  } catch {
    /* storage may be blocked */
  }
  return "uz";
};

const Ctx = createContext({ lang: "uz", setLang: () => {}, t: (s) => s });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(read);
  const setLang = useCallback((l) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = useCallback(
    (s, ...args) => {
      const e = D[s];
      let out = lang === "ru" && e ? e[0] : lang === "en" && e ? e[1] : s;
      args.forEach((a, i) => {
        out = out.split("{" + i + "}").join(a);
      });
      return out;
    },
    [lang]
  );
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx).t;
export const useLang = () => useContext(Ctx);
