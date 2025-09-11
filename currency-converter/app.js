
const API_BASE = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1";
const FALLBACK_BASE = "https://latest.currency-api.pages.dev/v1"; // optional fallback

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

for (let select of dropdowns) {
  for (currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") newOption.selected = "selected";
    if (select.name === "to" && currCode === "INR") newOption.selected = "selected";
    select.append(newOption);
  }
  select.addEventListener("change", (evt) => updateFlag(evt.target));
}

async function fetchRatesOnce(base, from) {
  const url = `${base}/currencies/${from}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount input");
  let amtVal = Number(amount.value);
  if (!amtVal || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }
  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();

  try {
    
    let data = await fetchRatesOnce(API_BASE, from);
    let rate = data[from]?.[to];
    
    if (rate === undefined) {
      data = await fetchRatesOnce(FALLBACK_BASE, from);
      rate = data[from]?.[to];
    }
    if (rate === undefined) {
      msg.innerText = `Rate not available for ${from.toUpperCase()} → ${to.toUpperCase()}`;
      return;
    }
    const finalAmount = (amtVal * rate).toFixed(4);
    msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
  } catch (err) {
    msg.innerText = `Failed to fetch rates, please retry`;
  }
};

const updateFlag = (element) => {
  const currCode = element.value;
  const countryCode = countryList[currCode];
  const newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  const img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", updateExchangeRate);
