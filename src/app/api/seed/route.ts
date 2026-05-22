import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Only admins can seed the database
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const packages = [
      { category: "starter", tier: "Silver", name: "Starter Silver", maxPhoneNumbers: 5, features: JSON.stringify(["1-5 Phone Numbers", "Custom RBT Tones", "Basic Analytics", "Email Support"]), price3mo: 75000, price6mo: 135000, price12mo: 240000, popular: false },
      { category: "starter", tier: "Bronze", name: "Starter Bronze", maxPhoneNumbers: 15, features: JSON.stringify(["6-15 Phone Numbers", "Custom RBT Tones", "Basic Analytics", "Email Support", "Scheduled Tones"]), price3mo: 150000, price6mo: 270000, price12mo: 480000, popular: false },
      { category: "starter", tier: "Gold", name: "Starter Gold", maxPhoneNumbers: 30, features: JSON.stringify(["16-30 Phone Numbers", "Custom RBT Tones", "Advanced Analytics", "Priority Email Support", "Scheduled Tones", "Time-Based Routing"]), price3mo: 300000, price6mo: 540000, price12mo: 960000, popular: false },
      { category: "starter", tier: "Ruby", name: "Starter Ruby", maxPhoneNumbers: 50, features: JSON.stringify(["31-50 Phone Numbers", "Custom RBT Tones", "Advanced Analytics", "Priority Email Support", "Scheduled Tones", "Time-Based Routing", "Audio Recording"]), price3mo: 450000, price6mo: 810000, price12mo: 1440000, popular: true },
      { category: "business", tier: "Silver", name: "Business Silver", maxPhoneNumbers: 100, features: JSON.stringify(["51-100 Phone Numbers", "Custom RBT Tones", "Advanced Analytics", "Priority Support", "Scheduled Tones"]), price3mo: 750000, price6mo: 1350000, price12mo: 2400000, popular: false },
      { category: "business", tier: "Bronze", name: "Business Bronze", maxPhoneNumbers: 200, features: JSON.stringify(["101-200 Phone Numbers", "Custom RBT Tones", "Advanced Analytics", "Priority Support", "Scheduled Tones", "Time-Based Routing", "Dedicated Account Manager"]), price3mo: 1200000, price6mo: 2160000, price12mo: 3840000, popular: false },
      { category: "business", tier: "Gold", name: "Business Gold", maxPhoneNumbers: 350, features: JSON.stringify(["201-350 Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Support", "Scheduled Tones", "Time-Based Routing", "Dedicated Account Manager", "API Access"]), price3mo: 1800000, price6mo: 3240000, price12mo: 5760000, popular: true },
      { category: "business", tier: "Ruby", name: "Business Ruby", maxPhoneNumbers: 500, features: JSON.stringify(["351-500 Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Support", "Scheduled Tones", "Time-Based Routing", "Dedicated Account Manager", "API Access", "Custom Integrations"]), price3mo: 2400000, price6mo: 4320000, price12mo: 7680000, popular: false },
      { category: "premium", tier: "Silver", name: "Premium Silver", maxPhoneNumbers: 750, features: JSON.stringify(["501-750 Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Support", "Scheduled Tones", "API Access"]), price3mo: 3000000, price6mo: 5400000, price12mo: 9600000, popular: false },
      { category: "premium", tier: "Bronze", name: "Premium Bronze", maxPhoneNumbers: 1000, features: JSON.stringify(["751-1000 Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Support", "Scheduled Tones", "API Access", "Dedicated Account Manager", "Custom Integrations"]), price3mo: 4500000, price6mo: 8100000, price12mo: 14400000, popular: true },
      { category: "premium", tier: "Gold", name: "Premium Gold", maxPhoneNumbers: 1500, features: JSON.stringify(["1001-1500 Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Dedicated Support", "Scheduled Tones", "API Access", "Dedicated Account Manager", "Custom Integrations", "White-Label Option"]), price3mo: 6000000, price6mo: 10800000, price12mo: 19200000, popular: false },
      { category: "premium", tier: "Ruby", name: "Premium Ruby", maxPhoneNumbers: 9999, features: JSON.stringify(["1501+ Phone Numbers", "Custom RBT Tones", "Real-Time Analytics", "24/7 Dedicated Support", "Scheduled Tones", "API Access", "Dedicated Account Manager", "Custom Integrations", "White-Label Option", "SLA Guarantee"]), price3mo: 8000000, price6mo: 14400000, price12mo: 25600000, popular: false },
    ];

    await db.assignedNumber.deleteMany();
    await db.subscription.deleteMany();
    await db.package.deleteMany();

    for (const pkg of packages) {
      await db.package.create({ data: pkg });
    }

    // Ensure admin user exists with bcrypt password
    const existingAdmin = await db.user.findUnique({ where: { email: "admin@tunepoa.com" } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await db.user.create({
        data: { name: "Admin", email: "admin@tunepoa.com", password: hashedPassword, role: "admin", status: "active" },
      });
    } else {
      // Migrate admin password to bcrypt if needed
      if (!existingAdmin.password.startsWith("$2a$") && !existingAdmin.password.startsWith("$2b$")) {
        const hashedPassword = await bcrypt.hash("admin123", 12);
        await db.user.update({ where: { id: existingAdmin.id }, data: { password: hashedPassword } });
      }
    }

    return NextResponse.json({ message: "Database seeded successfully", packages: packages.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
