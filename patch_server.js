const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(`            } catch (fallbackErr: any) {
                console.log('[API] 3.6-flash also failed, trying 2.5-flash fallback...');
                result = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: productSchema,
                    temperature: 0.1
                  }
                });
            }`, `            } catch (fallbackErr: any) {
                console.log('[API] 3.6-flash also failed.');
                throw fallbackErr;
            }`);
fs.writeFileSync('server.ts', code);
