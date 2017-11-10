var boolStartup = true;
var charDelimiter = "|";  //SLAM 3.0 and Rabbit 2.86
var subDelimiter = "~";
var SymbolContrastRaw = 0;
var ReflectMinRaw = 0;
var EdgeContrastMinRaw = 0;
var PrintGrowthRaw = 0;
var SingleScanIntegrityRaw = 0;
var MultiScanIntegrityRaw = 0;
var NumofBarcode = 0;
var skipthisbarcode = false;
	
function convertSymbolContrast(raw)
{
	var grade = "0";
	if ( raw >= 0.25 ) grade = "4"; 
	else if ( raw >= 0.15 ) grade = "3"; 
	else if ( raw >= 0.10 ) grade = "2"; 
	else if ( raw >= 0.05 ) grade = "1"; 
	 
	return grade;
}
function convertReflectMin(raw)
{
	var grade = "0";
	if ( raw <= 128) grade = "1"; 
	 
	return grade;
}
	
	 
function convertEdgeContrastMin(raw)
{
	var grade = "0";
	if ( raw >= 0.15 ) grade = "1"; 
	 
	return grade;
}
	
function convertPrintGrowth(raw)
{
	var grade = "0";
	if ( raw <= 0.20 ) grade = "1"; 
	 
	return grade;
}
	
function convertSingleScanIntegrity(raw)
{
	var grade = 0;
	if ( raw >= 4 ) grade = "4"; 
	else if ( raw < 4 ) grade = "3"; 
	else if ( raw < 3 ) grade = "2"; 
	else if ( raw < 2 ) grade = "1"; 
	else if ( raw < 1 ) grade = "0"; 
	 
	return grade;
}
	
function convertMultiScanIntegrity(raw)
{
	var grade = "0";
	if ( raw >= 0.55 ) grade = "4"; 
	else if ( raw >= 0.40 ) grade = "3"; 
	else if ( raw >= 0.30 ) grade = "2"; 
	else if ( raw >= 0.20 ) grade = "1"; 
	 
	return grade;
}
	
	
	
	
function onResult (decodeResults, readerProperties, output)
{
	if(boolStartup)
	{
		boolStartup = false; //never call again unless reader has rebooted or script recompiled
		// dmccSet("DATA.RESULT-TYPE", "512"); //Compatible with firmware 5.2 and up only!!!
		// dmccSet("INPUT-STRING.MODE","0"); //Compatible with firmware 5.2 and up only!!!
		// dmccSet("INPUT-STRING.ENABLE", "ON"); //Compatible with firmware 5.2 and up only!!!
		// dmccSet("INPUT-STRING.HEADER", "\x02"); //Compatible with firmware 5.2 and up only!!!
		// dmccSet("INPUT-STRING.FOOTER", "\x03"); //Compatible with firmware 5.2 and up only!!!
		// dmccCommand("BEEP", 2, 1); //Compatible with firmware 5.2 and up only!!!
	}
	
	var OutputContent = '';
	var BarcodeContent = 'BARCODES~';
	var ScannerContent = 'SCANNNERS~';
	var METRICS = 'METRICS~';
	       
	var source = new Array();
	source.push('');
	source.push('');
	source.push('');
	source.push('');
	source.push('');
	source.push('');
	       
	       
	var SourceCnt = new Array();
	SourceCnt.push(0);
	SourceCnt.push(0);
	SourceCnt.push(0);
	SourceCnt.push(0);
	SourceCnt.push(0);
	SourceCnt.push(0);
	
	       
	       
	for ( var i = 0; i < decodeResults.length; i++ ) // Loop through results
	{      
		if ( decodeResults[i].decoded )
		{
			skipthisbarcode = false;
	                     
			for (var j = 0; j < i; j++)
			{
				if (decodeResults[i].content == decodeResults[j].content)
				{
					skipthisbarcode = true;
				}
			}
	                     
			if (skipthisbarcode == false)
			{
				var result = decodeResults[i].content.toString();
				//Using decodedResult.Source to find the location of the scanner. L1, T1 or R1
				var devicesource = decodeResults[i].source;
				var loc = devicesource.substr(0, 2)
				for (var j = 0; j < 5; j++)
				{
					if (source[j] == '')
					{
						source[j] = loc;
						SourceCnt[j] = SourceCnt[j] + 1;
	                                         
						break;
					}
					else
					{
						if (loc == source[j])
						{
							SourceCnt[j] = SourceCnt[j] + 1;
	                                                
							break;
						}
					}
				}
				SymbolContrastRaw += decodeResults[i].metrics.symbolContrast.raw;
				ReflectMinRaw += decodeResults[i].metrics.reflectMin.raw;
				EdgeContrastMinRaw += decodeResults[i].metrics.edgeContrastMin.raw;
				PrintGrowthRaw += decodeResults[i].metrics.printGrowth.raw;
				SingleScanIntegrityRaw += decodeResults[i].metrics.singleScanInt.raw;
				MultiScanIntegrityRaw += decodeResults[i].metrics.multiScanInt.raw;
				NumofBarcode += 1;
	                       
	                           
	                           
				BarcodeContent += result + '~';
			}
		}
	}
	if(NumofBarcode > 0)
	{
		METRICS += 
			convertSymbolContrast(SymbolContrastRaw / NumofBarcode) +
			subDelimiter + convertReflectMin(ReflectMinRaw / NumofBarcode) +
			subDelimiter + convertEdgeContrastMin(EdgeContrastMinRaw / NumofBarcode) +
			subDelimiter + convertPrintGrowth(PrintGrowthRaw / NumofBarcode) +
			subDelimiter + convertSingleScanIntegrity(SingleScanIntegrityRaw / NumofBarcode) +
			subDelimiter + convertMultiScanIntegrity(MultiScanIntegrityRaw / NumofBarcode);
	              
	}
	//generate scannercontent
	for (var j = 0; j < 6; j++)
	{
	              
		if (source[j] != '')
		{
			ScannerContent += source[j] + '~'; 
			ScannerContent += SourceCnt[j] + '~';
		}
	}
	       
	//remove the very last ~ and replace it with a pipe
	if (BarcodeContent.length > 10)
	{
		var trimout = BarcodeContent.substr(0, BarcodeContent.length - 1);
		BarcodeContent = trimout + '|';
	}
	else
	{
		BarcodeContent = BarcodeContent + '|';
	}
	if (ScannerContent.length > 10)
	{
		var scannerout = ScannerContent.substr(0, ScannerContent.length - 1);
		ScannerContent = scannerout + '|';
	}
	else
	{
		ScannerContent = ScannerContent + '|';   
	}
	//OutputContent += ScannerContent;
	OutputContent += BarcodeContent;
	OutputContent += METRICS;  
	       
	       
	              
	output.content = OutputContent;
	
}
