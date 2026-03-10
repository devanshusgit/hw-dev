const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get('name') || '',
      phone: data.get('phone') || '',
      email: data.get('email') || '',
      destination: data.get('destination') || '',
      intake: data.get('intake') || '',
      message: data.get('message') || ''
    };

    const text = `Hi HW Dev, I want to book a consultation.%0A%0AName: ${encodeURIComponent(payload.name)}%0APhone: ${encodeURIComponent(payload.phone)}%0AEmail: ${encodeURIComponent(payload.email)}%0APreferred destination: ${encodeURIComponent(payload.destination)}%0AIntake: ${encodeURIComponent(payload.intake)}%0ARequirements: ${encodeURIComponent(payload.message)}`;
    const whatsappUrl = `https://wa.me/919326213082?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (note) note.textContent = 'Opened WhatsApp with your consultation details.';
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));