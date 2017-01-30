var boardTextHeight=12;
var boardRowHeight=51;
var lastClickPos=null;

var nextAddPiece="null";
var add_piece=false;

var pieceMap=[['rK','rA','rB','rN','rR','rC','rP'],['bk','ba','bb','bn','br','bc','bp']];


window.onload=function()
{
	drawBoard();
	initBoardPos();

	document.getElementById('table_board').addEventListener('mousedown', board_click);
	document.getElementById('piece_list').addEventListener('click', piece_list_click);
	

	for(i=0;i<10;i++)
	{
		for(j=0;j<9;j++)
		{
			document.getElementById('td_'+i+j).addEventListener('dragstart', td_dragstart);
			document.getElementById('td_'+i+j).addEventListener('dragover', td_dragover);
			document.getElementById('td_'+i+j).addEventListener('drop', td_drop);
		}
	}

	document.getElementById('piece_list').addEventListener('dragstart', pl_dragstart);
	document.getElementById('piece_list').addEventListener('dragover', pl_dragover);
	document.getElementById('piece_list').addEventListener('drop', pl_drop);

	prevent_right_click_menu();
}

function prevent_right_click_menu()
{
	document.oncontextmenu=function()
	{
		return false;
	}
}

function getRelativePos(e)
{
	var r=e.currentTarget.getBoundingClientRect();
	return{x:e.clientX-r.left,y:e.clientY-r.top};
}

function getBoardPos(pos)
{
	return{x:parseInt(pos.x/boardRowHeight),y:parseInt((pos.y-boardTextHeight)/boardRowHeight)};
}

function updateFEN()
{
	var board=document.getElementById('table_board');
	var fen="";

	for(var i=0;i<10;i++)
	{
		var fenSeg="";
		for(var j=0;j<9;j++)
		{
			fenSeg+=board.rows[i+1].cells[j].className[7];
		}
		// console.log(fenSeg);

		var fenSegCat="";
		for(k=0;k<9;k++)
		{
			if(fenSeg[k]!='u') 
			{
				fenSegCat+=fenSeg[k];
			}
			else
			{
				var counter=1;
				while (fenSeg[k+counter]=='u') 
				{
					counter++;
				}
				fenSegCat+=counter;
				k+=(counter-1);
			}			
		}

		// console.log(fenSegCat);
		fen+=(fenSegCat+(i<9?'/':''));
	}

	fen+=(document.getElementById('red_move').checked?' w':' b');
	document.getElementById('board_str').value=fen;
	// console.log(fen);

	lastClickPos=null;
}

function piece_list_click(e)
{
	add_piece=true;
	var pos=getRelativePos(e);
	pos={x:parseInt(pos.x/boardRowHeight),y:parseInt(pos.y/boardRowHeight)};
	nextAddPiece=pieceMap[pos.y][pos.x];
}

//dragging also triggers this function, as it is bind to mousedown event
function board_click(e)
{
	var pos=getRelativePos(e);
	//clicked in the text area
	if(pos.y<boardTextHeight || pos.y>boardRowHeight*10+boardTextHeight) return;

	pos=getBoardPos(pos);
	// console.log('x: '+pos.x+' y: '+pos.y);

	var board=document.getElementById('table_board');
	var targetCell=board.rows[pos.y+1].cells[pos.x];

	//delete a piece
	if(e.button==2){
		targetCell.className="chess null";
		updateFEN();
		return;
	}

	//add a piece
	if(add_piece)
	{
		targetCell.className="chess "+nextAddPiece;
		add_piece=false;
		updateFEN();
		return;
	}

	//move a piece
	if(lastClickPos==null)	
	{
		if(targetCell.className!=="chess null")
		{
			//first click
			lastClickPos=pos;
		}		
	}
	else
	{
		//second click
		if(lastClickPos.x!=pos.x || lastClickPos.y!=pos.y)
		{
			var sourceCell=board.rows[lastClickPos.y+1].cells[lastClickPos.x];
			targetCell.className=sourceCell.className;
			sourceCell.className="chess null";
			updateFEN();
		}
		lastClickPos=null;
	}
}

function clearBoard()
{
	var board=document.getElementById('table_board');
	for(var i=0;i<10;i++)
		for(var j=0;j<9;j++)
			board.rows[i+1].cells[j].className="chess null";
	board.rows[1].cells[5].className="chess bk";
	board.rows[10].cells[4].className="chess RK";
	updateFEN();
}

function drawBoard()
{
	var html_seg='<table id="table_board" class="table_board" cellpadding="0px" cellspacing="0px"><tbody>';

	//<td class="td_number">1</td>
	html_seg+='<tr>';
	for(i=1;i<=9;i++)
	{
		html_seg+='<td class="td_number">'+i+"</td>";
	}
	html_seg+='</tr>\n';

	for(i=0;i<10;i++)
	{
		html_seg+='<tr>';
		for(j=0;j<9;j++)
		{
			html_seg+='<td class="chess" draggable="true" id=\"td_'+i+j+'\"></td>';
		}
		html_seg+='</tr>\n';
	}

	html_seg+='<tr>';
	for(i=1;i<=9;i++)
	{
		html_seg+='<td class="td_number">'+(10-i)+"</td>";
	}
	html_seg+='</tr>\n';

	html_seg+='</tbody></table>';

	document.getElementById('board_div').innerHTML=html_seg;
}

function initBoardPos(board_str)
{
	if(board_str==null) board_str="rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w";

	var move_side=board_str.split(' ')[1][0];
	if(move_side=='r' || move_side=='w') 
	{
		document.getElementById('red_move').checked=true;
	}
	else
	{
		document.getElementById('black_move').checked=true;
	}

	board_str=board_str.split(' ')[0];
	document.getElementById('board_str').value=board_str+' '+move_side;
	
	var board_str_array=board_str.split('/');
	if(board_str_array.length!=10) return;

	var board=document.getElementById('table_board');
	for(i=0;i<10;i++)
	{
		var str=board_str_array[i]
		var pointer=0;
		for(j=0;j<str.length;j++)
		{
			if(isNaN(str[j]))
			{
				//piece
				board.rows[i+1].cells[pointer].className="chess "+(str[j]>='a' && str[j]<='z' ? 'b' :'r')+str[j];
				pointer++;
			}
			else
			{
				//null cells
				var num=parseInt(str[j]);
				for(k=0;k<num;k++)
				{
					board.rows[i+1].cells[pointer+k].className="chess null";
				}
				pointer+=num;
			}
		}
	}
}