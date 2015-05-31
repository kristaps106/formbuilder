<?php namespace EntityAudit;

use Doctrine\ORM\Query\Lexer;

class containsIndustryFunction extends \Doctrine\ORM\Query\AST\Functions\FunctionNode
{
    public $regexpExpression = null;
    public $valueExpression = null;

    public function parse(\Doctrine\ORM\Query\Parser $parser)
    {
        $parser->match(Lexer::T_IDENTIFIER);
        $parser->match(Lexer::T_OPEN_PARENTHESIS);
        $this->regexpExpression = $parser->StringPrimary();
        $parser->match(Lexer::T_COMMA);
        $this->valueExpression = $parser->StringExpression();
        $parser->match(Lexer::T_CLOSE_PARENTHESIS);
    }

    public function getSql(\Doctrine\ORM\Query\SqlWalker $sqlWalker)
    {
        //http://punkave.com/window/2012/07/24/for-the-php-crowd-adding-custom-functions-to-doctrine-2-dql
        // $qb->andWhere("containsIndustry('example', f.name) != false");
        /*
        return '(' . $this->valueExpression->dispatch($sqlWalker) . ' REGEXP ' .
        $sqlWalker->walkStringPrimary($this->regexpExpression) . ')';
        */
        return true;
    }
}