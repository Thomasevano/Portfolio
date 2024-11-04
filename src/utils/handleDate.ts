function handleDate(date: Date, lang: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(lang, options).format(date);
}

export default handleDate;