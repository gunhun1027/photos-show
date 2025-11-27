// 在这里填入您的 Supabase 项目配置
// 1. 访问 https://supabase.com 创建免费项目
// 2. 在 Project Settings -> API 中找到 URL 和 anon public key

export const SUPABASE_URL = "https://zyjhdjdiquoiqbcbwctz.supabase.co"; 
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5amhkamRpcXVvaXFiY2J3Y3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA3NzcsImV4cCI6MjA3OTgyNjc3N30.23N7PJmgcPoJRFKbRzSBTZH4TuneH_UQJopz_Z9Xb_U"; 

export const isCloudEnabled = () => {
    return SUPABASE_URL !== "" && SUPABASE_KEY !== "";
};