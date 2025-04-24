// index.html → login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const role  = document.getElementById('role').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) {
        const { error } = await res.json();
        return alert(error);
      }
      const data = await res.json();
      // if User: get userId from response
      const userId = data.userId || '';
      window.location.href = `dashboard.html?role=${role}&userId=${userId}`;
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  });
}

// dashboard.html → fetch bills
if (window.location.pathname.endsWith('dashboard.html')) {
  document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const role   = params.get('role');
    const userId = params.get('userId');
    const container = document.getElementById('bills');

    try {
      const res  = await fetch(`/dashboard?role=${role}&userId=${userId}`);
      const { bills } = await res.json();
      if (!bills || bills.length === 0) {
        container.innerHTML = '<p>No bills found.</p>';
        return;
      }

      let html = `<table>
        <thead><tr>`;
      if (role === 'Admin') html += `<th>Email</th>`;
      html += `<th>Bill ID</th><th>Units</th><th>Amount</th><th>Due Date</th><th>Status</th>`;
      html += `</tr></thead><tbody>`;

      let total = 0;
      bills.forEach(b => {
        total += parseFloat(b.bill_amount);
        const date = new Date(b.due_date).toLocaleDateString();
        html += `<tr>`;
        if (role === 'Admin') html += `<td>${b.email}</td>`;
        html += `
          <td>${b.bill_id}</td>
          <td>${b.units_consumed}</td>
          <td>${parseFloat(b.bill_amount).toFixed(2)}</td>
          <td>${date}</td>
          <td style="color:${b.status==='Paid'?'green':'red'}">${b.status}</td>
        `;
        html += `</tr>`;
      });

      html += `<tr class="total">
        <td colspan="${role==='Admin'?4:3}">Total Due</td>
        <td colspan="2">$${total.toFixed(2)}</td>
      </tr>`;

      html += `</tbody></table>`;
      container.innerHTML = html;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p style="color:red;">Failed to load bills.</p>';
    }
  });
}

// profile.html → stub
const profileForm = document.getElementById('updateProfileForm');
if (profileForm) {
  profileForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Profile updated (simulation)!');
  });
}
