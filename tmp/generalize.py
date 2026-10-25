from pathlib import Path
p=Path('src/lib/intelligence.ts');s=p.read_text(encoding='utf-8')
s=s.replace('if (!matched && region.table)\n        unresolved.push(', 'if (!matched) {\n        for(const field of scalars){if(values(field,region.quote).length>=2){const c=changes.find(c=>c.field===field);if(c){c.kind="Uncertain";c.explanation="The amendment could not be matched to the original old value or clause. Do not apply this change without review.";}}}\n        unresolved.push(')
s=s.replace('`Unresolved amendment row: ${region.quote.slice(0, 160).replace(/\\s+/g, " ")}`,\n        );','`Unresolved amendment instruction: ${region.quote.slice(0, 160).replace(/\\s+/g, " ")}`,\n        );\n      }')
s=s.replace('const deletion = /Delete\\s+the\\s+requirement[^.]*ISO\\s+9001[^.]*\\./gi;', 'const deletion = /(?:Delete|Remove)\\s+(?:the\\s+)?(?:requirement|condition)[^.]*?(ISO\\s+\\d+)[^.]*\\./gi;')
s=s.replace('if (before && !before.conflict && /ISO\\s+9001/i.test(before.value))','if (before && !before.conflict && before.value.toLowerCase().includes(m[1].toLowerCase()))')
s=s.replace('"The amendment explicitly removes the ISO 9001 condition. Other eligibility requirements are not removed by this instruction."','`The amendment explicitly removes the ${m[1]} condition. Other eligibility requirements are not removed by this instruction.`')
s=s.replace('"An ISO 9001 deletion could not be matched confidently to the original."','"A certification deletion could not be matched confidently to the original."')
# retain every quoted replacement, even for conditions outside supported scalar fields
needle='    const deletion = '
start=s.index(needle)
s=s[:start]+'''    for(const m of page.text.matchAll(/(?:replace|substitute)\\s+["“]([^"”]+)["”]\\s+(?:with|by)\\s+["“]([^"”]+)["”]/gi)){
      const matches=original.pages.filter(p=>p.text.includes(m[1]));
      const instruction=fact(revised,page,m[0],m[0],m.index);
      const before=matches.length===1?fact(original,matches[0],m[1],m[1],matches[0].text.indexOf(m[1])):undefined;
      const after=fact(revised,page,m[2],m[0],m.index);
      if(before)before.normalized=canonical('otherConditions',before.value);
      after.normalized=canonical('otherConditions',after.value);
      changes.push({field:'otherConditions',kind:before?'Modified':'Uncertain',before,after,instruction,method:'Quoted clause replacement',explanation:before?'The amendment explicitly replaces the quoted original wording. Review its practical and legal effect in context.':'The old quotation was not uniquely located in the original document.'});
    }
''' +s[start:]
p.write_text(s,encoding='utf-8')
