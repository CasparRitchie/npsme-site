import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0C1224] to-[#0B0F19] text-slate-200">
      <NavBar />
      <Routes>
        <Route path="/" element={<NpsMeLanding />} />
        <Route path="/milestone-nps" element={<MilestoneNps />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/social-listening" element={<SocialListening />} />
        <Route path="*" element={<NpsMeLanding />} />
      </Routes>
      <Footer />  {/* 👈 unified footer */}
    </div>
  );
}
