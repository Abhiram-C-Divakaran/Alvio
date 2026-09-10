const body = JSON.stringify({source_code:'print("hello")', language:'python3', api_key:'guest'});
fetch('https://api.paiza.io/runners/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: body
})
.then(res => res.json())
.then(data => {
  console.log('CREATE:', data);
  if (data.id) {
    setTimeout(() => {
      fetch('https://api.paiza.io/runners/get_details?id=' + data.id + '&api_key=guest')
      .then(r => r.json())
      .then(d => console.log('DETAILS:', d));
    }, 2000);
  }
})
.catch(console.error);
