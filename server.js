const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Sayfa yönlendirmeleri
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/roadmap', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'roadmap.html'));
});
app.get('/sessions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sessions.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Admin şifre kontrolü
app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  const adminPassword = "alikocistifa1907";

  if (password === adminPassword) {
    res.send(`
      <script>
        sessionStorage.setItem("isAdmin", "true");
        window.location.href = "/admin";
      </script>
    `);
  } else {
    res.send(`
      <script>
        alert("Şifre hatalı!");
        window.location.href = "/admin-login.html";
      </script>
    `);
  }
});

// Kayıt işlemi
app.post('/submit', (req, res) => {
  const formData = req.body;

  if (!formData.name || !formData.email || !formData.university || !formData.password) {
    return res.status(400).send("Eksik bilgi gönderildi.");
  }

  let data = [];
  if (fs.existsSync('kaydol.json')) {
    data = JSON.parse(fs.readFileSync('kaydol.json'));
  }

  const newUser = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone || '',
    university: formData.university,
    password: formData.password,
    attended: []
  };

  data.push(newUser);
  fs.writeFileSync('kaydol.json', JSON.stringify(data, null, 2));

  console.log("Yeni kayıt:", newUser);

  res.redirect('/?success=true');
});

// Giriş işlemi
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync('kaydol.json')) {
    return res.send("Kayıt bulunamadı.");
  }

  const data = JSON.parse(fs.readFileSync('kaydol.json'));
  const match = data.find(user => user.email === email && user.password === password);

  if (match) {
    res.send(`
      <script>
        sessionStorage.setItem("name", "${match.name}");
        sessionStorage.setItem("university", "${match.university}");
        sessionStorage.setItem("email", "${match.email}");
        window.location.href = "/dashboard";
      </script>
    `);
  } else {
    res.send("E-posta veya şifre hatalı.");
  }
});

// Seans katılımı kaydetme
app.post('/attend', (req, res) => {
  const { email, sessionId } = req.body;

  if (!email || !sessionId) {
    return res.status(400).send("Eksik veri.");
  }

  if (!fs.existsSync('kaydol.json')) {
    return res.status(404).send("Kayıtlı kullanıcı bulunamadı.");
  }

  const data = JSON.parse(fs.readFileSync('kaydol.json'));
  const userIndex = data.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).send("E-posta ile kullanıcı bulunamadı.");
  }

  if (!data[userIndex].attended) {
    data[userIndex].attended = [];
  }

  if (!data[userIndex].attended.includes(sessionId)) {
    data[userIndex].attended.push(sessionId);
    fs.writeFileSync('kaydol.json', JSON.stringify(data, null, 2));
  }

  res.status(200).send("Katılım kaydedildi.");
});

// Admin panel verisi
app.get('/admin-data', (req, res) => {
  if (!fs.existsSync('kaydol.json')) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync('kaydol.json'));
  res.json(data);
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
