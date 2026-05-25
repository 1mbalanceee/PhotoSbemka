// Dummy entrypoint to satisfy Vercel's zero-config framework builder.
// All actual API requests are routed to api/leads.js by vercel.json rewrites,
// and all frontend pages are served statically.
module.exports = (req, res) => {
  res.status(200).send('Photographer Portfolio Backend is active.');
};
