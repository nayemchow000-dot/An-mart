const fs = require('fs');
let code = fs.readFileSync('src/pages/public/ProductLandingPage.tsx', 'utf8');

const faqRender = `
          if (section.type === 'faq' && config.faqs?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 my-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.faqTitle}</h2>
                <div className="space-y-3">
                  {config.faqs.map(faq => (
                    <details key={faq.id} className="group bg-white p-5 rounded-2xl border border-[#F0EBE1] cursor-pointer">
                      <summary className="flex justify-between items-center font-bold text-[#2C3E35] list-none">
                        <span>{faq.question}</span>
                        <span className="transition group-open:rotate-180">
                          <ChevronDown size={20} />
                        </span>
                      </summary>
                      <p className="text-[#5C6E64] mt-3 leading-relaxed border-t border-[#F0EBE1] pt-3">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            );
          }
`;

code = code.replace(/if \(section\.type === 'contact'/, faqRender + '\n          if (section.type === \'contact\'');

fs.writeFileSync('src/pages/public/ProductLandingPage.tsx', code);
