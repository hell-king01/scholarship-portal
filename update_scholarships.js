
async function update() {
    const url = 'https://vemskadgdfktywjodxop.supabase.co/rest/v1/scholarships?id=not.is.null';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbXNrYWRnZGZrdHl3am9keG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTkxMzQsImV4cCI6MjA4Njc5NTEzNH0.o3EV4diqJNnLIsS4hC1C5E1qi-XUhXQt-NoHNRYvfeU';

    // Set deadline to 10 days from now
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 10);

    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ deadline: upcomingDate.toISOString() })
    });
    console.log(res.status, await res.text());
}
update();
