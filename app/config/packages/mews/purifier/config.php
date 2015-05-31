<?php

/*
 * This file is part of HTMLPurifier Bundle.
 * (c) 2012 Maxime Dizerens
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return array(
	'encoding' => 'UTF-8',
    'finalize' => true,
    'preload'  => false,
    'settings' => array(
        'default' => array(
            'HTML.Doctype'             => 'XHTML 1.0 Strict',
            'HTML.Allowed'             => 'div,b,strong,i,em,a[href|title],ul,ol,li,p[style],br,span[style],img[width|height|alt|src]',
            'CSS.AllowedProperties'    => 'font,font-size,font-weight,font-style,font-family,text-decoration,padding-left,color,background-color,text-align',
            'AutoFormat.AutoParagraph' => true,
            'AutoFormat.RemoveEmpty'   => true,
        ),
        'print_pdf' => array(
            'HTML.Doctype'              => 'HTML 4.01 Transitional',
            'Core.Encoding'             => 'UTF-8',
            'HTML.Allowed'              => 'sub, sup, table[class|style], tbody, thead, tfoot, tr[style|class], td[colspan|rowspan|scope|style|class],th[colspan|rowspan|scope|style|class], div[id|class], b, p[style|class], ol, ul, li, h1, h2, h3, h4, h5, img[src]',
            'Core.HiddenElements'       => array('script' => true, 'span' => true),
            //'Filter.ExtractStyleBlocks' => true,
            'CSS.AllowedProperties'    => 'font,font-size,font-weight,font-style,font-family,text-decoration,padding-left,color,background-color,text-align',
            'AutoFormat.AutoParagraph'  => true,
            'AutoFormat.RemoveEmpty'    => true,
            'Core.LexerImpl'            => 'DirectLex'
        ),
    ),
);
