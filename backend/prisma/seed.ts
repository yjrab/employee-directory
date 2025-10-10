import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { EmployeePayload, UserPayload } from "../src/types/interfaces";

async function main() {
  console.log("Fetching random users...");
  const res = await fetch("https://randomuser.me/api/?results=50&nat=us,gb");
  const json = (await res.json()) as { results: Array<{ name: { first: string; last: string }; email: string; picture?: { medium?: string }; location?: { city?: string }; phone?: string }> };
  const results = json.results;

  for (const r of results) {
    const firstName = r.name.first;
    const lastName = r.name.last;
    const email = r.email;
    const picture = r.picture?.medium ?? undefined;
    const location = r.location?.city ?? undefined;
    const phone = r.phone ?? undefined;
    
    const jobTitles = ["Engineer","Designer","Product Manager","QA","HR","Sales"];
    const departments = ["Engineering","Design","Product","Quality","People","Sales"];
    const defaultPassword = "changeme";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const employeePayload: EmployeePayload = {
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      location,
      hireDate: new Date(),
      user: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        pictureUrl: picture,
        phone,
        role: "EMPLOYEE",
      } as UserPayload,
    };
  
    const employeeHashedPassword = await bcrypt.hash(employeePayload.user!.password!, 10);
    await prisma.employee.create({
        data: {
          jobTitle: employeePayload.jobTitle,
          department: employeePayload.department,
          location: employeePayload.location,
          hireDate: employeePayload.hireDate,
          user: {
            create: {
              email: employeePayload.user!.email,
              password: employeeHashedPassword,
              firstName: employeePayload.user!.firstName!,
              lastName: employeePayload.user!.lastName!,
              pictureUrl: employeePayload.user!.pictureUrl,
              phone: employeePayload.user!.phone,
              role: employeePayload.user!.role || "EMPLOYEE",
            },
          },
        },
    });
  }  

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
