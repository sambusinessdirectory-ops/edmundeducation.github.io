// Transcribed from the chart supplied by the user (Task 1 · T1-005).
export const title = 'The visual below shows the top ten countries for the production and consumption of electricity in 2014.';
export const data = [
 ['China',5398,5322],['United States',4099,3866],['Russia',1057,1038],
 ['Japan',936.2,856.7],['India',871,698.8],['Canada',618.9,499.9],
 ['France',561.2,462.9],['Brazil',530.7,455.8],['Germany',526.6,582.5],['Korea, Rep.',485.1,449.5]
];
export const palette = [
 {id:'green',name:'群組 1',color:'#368268',tint:'#d7eee2'},
 {id:'blue',name:'群組 2',color:'#447cb1',tint:'#dceafa'},
 {id:'amber',name:'群組 3',color:'#a77220',tint:'#f9e9bf'},
 {id:'rose',name:'群組 4',color:'#b65d79',tint:'#f6dfe7'},
 {id:'purple',name:'群組 5',color:'#8667af',tint:'#e9e0f5'}
];
export const format = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:6}).format(value);
// Explicit left-to-right arithmetic: the displayed parentheses show the same order.
export function calculate(values,operators) {
 if(values.length<2)return {error:'請選取至少兩個數字'};
 let result=values[0];
 if(!Number.isFinite(result))return {error:'請輸入有效數字'};
 for(let i=1;i<values.length;i++){
  const value=values[i],op=operators[i-1]||'+';
  if(!Number.isFinite(value))return {error:'請輸入有效數字'};
  if(op==='/'&&value===0)return {error:'不能除以 0'};
  if(op==='+')result+=value;else if(op==='-')result-=value;else if(op==='*')result*=value;else if(op==='/')result/=value;else return {error:'請選擇有效運算'};
  if(!Number.isFinite(result))return {error:'結果超出可計算範圍'};
 }
 return {value:Number(result.toPrecision(12))};
}
