(function () {
  const byId = (id) => document.getElementById(id);
  const productsNodes = [byId("home-plist"), byId("plist")].filter(Boolean);
  let products = [];

  function showProducts(items) {
    products = items;
    productsNodes.forEach((productsNode) => {
      productsNode.replaceChildren();
      items.forEach((product) => {
        const card = document.createElement("article");
        card.className = "card pcard";
        const icon = document.createElement("div");
        icon.className = "ico";
        icon.textContent = product.icon;
        const name = document.createElement("h3");
        name.textContent = product.name;
        const description = document.createElement("p");
        description.textContent = product.description;
        const rate = document.createElement("div");
        rate.className = "price";
        rate.textContent = product.rate;
        card.append(icon, name, description, rate);
        productsNode.appendChild(card);
      });
    });
    const select = byId("bt");
    if (select) {
      select.replaceChildren();
      items.concat([{ name: "Other" }]).forEach((product) => {
        const option = document.createElement("option");
        option.textContent = product.name;
        select.appendChild(option);
      });
    }
  }

  if (productsNodes.length) {
    fetch("/api/products")
      .then((response) => {
        if (!response.ok) throw new Error("Product list unavailable");
        return response.json();
      })
      .then((data) => showProducts(data.products || []))
      .catch(() => {
        productsNodes.forEach((productsNode) => {
          productsNode.textContent = "Product information is temporarily unavailable. Please contact us for details.";
        });
      });
  }

  const calcButton = byId("calc");
  if (calcButton) calcButton.addEventListener("click", async () => {
    const weight = Number(byId("w").value);
    const method = byId("m").value;
    const output = byId("out");
    if (!Number.isFinite(weight) || weight <= 0) {
      output.textContent = "Please enter a valid weight.";
      return;
    }
    output.textContent = "Calculating your estimate…";
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, method }),
      });
      const quote = await response.json();
      if (!response.ok) throw new Error(quote.error || "Unable to calculate estimate.");
      output.textContent = `Estimated cost: about $${quote.amount.toFixed(2)} · Delivery: ${quote.delivery}.`;
    } catch (error) {
      output.textContent = error.message || "Could not reach the quote service. Please try again.";
    }
  });

  const trackButton = byId("go");
  if (trackButton) trackButton.addEventListener("click", () => {
    const tracking = byId("t").value.trim();
    byId("tout").textContent = tracking
      ? `Tracking isn't connected yet. Send ${tracking} to us on WhatsApp for a status update.`
      : "Please enter a tracking number.";
  });

  const sendButton = byId("send");
  if (sendButton) sendButton.addEventListener("click", () => {
    const name = byId("cn").value.trim();
    const message = byId("cm").value.trim();
    window.location.href = `mailto:iradukundaellaherve@gmail.com?subject=${encodeURIComponent(`Shipping inquiry from ${name || "website"}`)}&body=${encodeURIComponent(message)}`;
  });

  function bookingText() {
    const value = (id) => byId(id).value.trim();
    if (!value("bn") || !value("bp") || !value("bx") || !value("bpay")) {
      byId("bout").textContent = "Please fill in your name, phone, payment method and a description of your goods.";
      return null;
    }
    byId("bout").textContent = "Thank you! Your booking message is ready to send.";
    return [
      "New shipment booking", `Name: ${value("bn")}`, `Phone: ${value("bp")}`,
      `Email: ${value("be") || "-"}`, `Payment method: ${value("bpay")}`, `Product type: ${value("bt")}`,
      `Weight: ${value("bw") || "-"} kg`, `Method: ${value("bm")}`,
      `From (China): ${value("bs") || "-"}`, `To (Rwanda): ${value("bd") || "-"}`,
      `Details: ${value("bx")}`,
    ].join("\n");
  }

  const whatsappBookingButton = byId("bwa");
  if (whatsappBookingButton) whatsappBookingButton.addEventListener("click", () => {
    const text = bookingText();
    if (text) window.open(`https://wa.me/250783553434?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  });
  const emailBookingButton = byId("bem");
  if (emailBookingButton) emailBookingButton.addEventListener("click", () => {
    const text = bookingText();
    if (text) window.location.href = `mailto:iradukundaellaherve@gmail.com?subject=${encodeURIComponent("Shipment booking")}&body=${encodeURIComponent(text)}`;
  });
})();
